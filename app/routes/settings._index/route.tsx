import { api } from "convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { LucideCheckCircle } from "lucide-react"
import { css } from "styled-system/css"
import { flex, hstack } from "styled-system/patterns"
import { Field } from "~/components/Field"
import { useAsyncCallback } from "~/helpers/useAsyncCallback"
import { button } from "~/styles/button"
import { input } from "~/styles/input"

export default function GeneralSettingsPage() {
  const world = useQuery(api.worlds.get)
  const update = useAsyncCallback(useMutation(api.worlds.update))
  return (
    <main className={css({ flex: 1 })}>
      <h2 className={css({ fontSize: "3xl", fontWeight: "light", mb: 2 })}>
        General Settings
      </h2>
      {world ? (
        <form
          className={flex({ direction: "column", gap: 3 })}
          onSubmit={(event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            update({ name: form.get("name") as string })
          }}
        >
          <Field label="Name" inputId="name">
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={world?.name}
              className={input()}
            />
          </Field>
          <div className={hstack({ gap: 4 })}>
            <button className={button()} disabled={update.loading}>
              <LucideCheckCircle /> {update.loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  )
}
