import { redirect, type ActionArgs } from "@remix-run/node"
import { useFetcher, useParams } from "@remix-run/react"
import { Trash } from "lucide-react"
import { type ReactNode } from "react"
import { zfd } from "zod-form-data"
import { getSession } from "~/auth.server"
import { db } from "~/db.server"
import { raise } from "~/helpers/errors"
import { forbidden, notFound, unauthorized } from "~/helpers/responses"
import { ConfirmModal } from "~/ui/confirm-modal"
import { LoadingSpinner } from "~/ui/loading"
import { sendWorldPatch } from "~/world-state"

export async function action({ request, params }: ActionArgs) {
  const body = zfd
    .formData({
      id: zfd.text(),
    })
    .parse(await request.formData())

  const { sessionId } = (await getSession(request)) ?? raise(unauthorized())

  const [user, character] = await Promise.all([
    db.user.findUnique({
      where: { sessionId },
      select: {
        id: true,
        memberships: {
          where: { worldId: params.worldId! },
        },
      },
    }),
    db.character.findUnique({
      where: { id: body.id },
      select: { ownerId: true },
    }),
  ])

  if (!character) {
    throw notFound()
  }

  const membership = user?.memberships[0]
  const canDelete =
    character.ownerId === user?.id || membership?.role === "OWNER"
  if (!canDelete) {
    throw forbidden()
  }

  await db.character.delete({ where: { id: body.id } })

  sendWorldPatch(params.worldId!, {
    characters: {
      $removeWhere: { id: body.id },
    },
  })

  return redirect(`..`)
}

export function DeleteCharacterButton({
  character,
  children,
  className,
}: {
  character: { id: string; name: string }
  children: ReactNode
  className?: string
}) {
  const params = useParams()
  const fetcher = useFetcher()
  return (
    <ConfirmModal
      title="Delete Character"
      body={`Are you sure you want to delete ${character.name}?`}
      confirmText={
        <>
          <Trash /> Delete {character.name}
        </>
      }
      onConfirm={() =>
        fetcher.submit(
          { id: character.id },
          {
            method: "post",
            action: `/worlds/${params.worldId}/delete-character`,
          },
        )
      }
    >
      {(show) => (
        <button
          name="id"
          value={character.id}
          className={className}
          disabled={fetcher.state !== "idle"}
          onClick={show}
        >
          {children}
          {fetcher.state !== "idle" && <LoadingSpinner size={6} />}
        </button>
      )}
    </ConfirmModal>
  )
}
