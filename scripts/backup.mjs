import { createClient } from "@supabase/supabase-js"
import chalk from "chalk"
import { config } from "dotenv"
import { execa } from "execa"
import cron from "node-cron"
import { createReadStream, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { z } from "zod"

config({ path: ".env", override: true })
if (existsSync(".env.production")) {
  config({ path: ".env.production", override: true })
}

const env = z
  .object({
    SUPABASE_URL: z.string(),
    SUPABASE_SERVICE_KEY: z.string(),
    DATABASE_URL: z.string(),
  })
  .parse(process.env)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

if (process.argv.includes("--now")) {
  await backup()
} else {
  console.info(chalk.dim("⚙ Starting backup cron job"))
  cron.schedule(`0 1 * * *`, backup)
}

async function backup() {
  const dumpFile = join(tmpdir(), `supabase-dump-${Date.now()}.sql`)

  try {
    console.info(chalk.dim("📦 Dumping database..."))

    await execa("pg_dump", ["-f", dumpFile], { stdio: "pipe" })

    console.info(chalk.dim("🚀 Uploading dump..."))
    const timestamp = new Date().toISOString().replace(/:/g, "-")
    const { error, data } = await supabase.storage
      .from("postgres-backup")
      .upload(`dump-${timestamp}.sql`, createReadStream(dumpFile))

    if (error) {
      console.error(chalk.red("❌ Upload failed:"), error)
      return
    }

    console.info(chalk.green(`✅ Uploaded to ${data.path}`))
  } catch (error) {
    console.error(chalk.red("❌ Backup failed."), error)
  }
}
