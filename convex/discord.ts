export async function getDiscordUser(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    return { user: null, response }
  }

  const data = (await response.json()) as {
    id: string
    global_name: string
    avatar: string | null
  }

  const user = {
    id: data.id,
    displayName: data.global_name,
    avatarUrl: data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
      : null,
  }

  return { user, response }
}
