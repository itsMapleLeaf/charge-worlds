import { api } from "convex/_generated/api"
import { type Id } from "convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { LucideUserPlus } from "lucide-react"
import { Suspense, useState, type ReactElement } from "react"
import { css } from "styled-system/css"
import { Menu, MenuButton, MenuItem, MenuPanel } from "~/components/Menu"
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "~/components/Modal"
import { Spinner } from "~/components/Spinner"
import { useQuerySuspense } from "~/convex"
import { useAsyncCallback } from "~/helpers/useAsyncCallback"
import { getSessionId } from "~/session"
import { CharacterEditor } from "./CharacterEditor"

export function CharacterMenu({ children }: { children: ReactElement }) {
	const [open, setOpen] = useState(false)
	const [characterModalOpen, setCharacterModalOpen] = useState(false)
	const [characterModalId, setCharacterModalId] = useState<Id<"characters">>()
	const sessionId = getSessionId()
	const characters = useQuerySuspense(api.characters.list)

	const create = useAsyncCallback(useMutation(api.characters.create), {
		onSuccess: (id) => {
			setOpen(false)
			setCharacterModalId(id)
			setCharacterModalOpen(true)
		},
	})

	return (
		<>
			<Menu open={open} onOpenChange={setOpen}>
				<MenuButton asChild>{children}</MenuButton>
				<MenuPanel side="top" align="center">
					{characters.map((character) => (
						<MenuItem
							key={character._id}
							onClick={() => {
								setCharacterModalId(character._id)
								setCharacterModalOpen(true)
							}}
						>
							<span className={css({ opacity: character.name ? 1 : 0.6 })}>
								{character.name || "Unnamed"}
							</span>
						</MenuItem>
					))}

					<MenuItem
						onClick={(event) => {
							event.preventDefault()
							create({ sessionId })
						}}
					>
						{create.loading ? <Spinner size={8} /> : <LucideUserPlus />}
						{create.loading ? null : "Create Character"}
					</MenuItem>
				</MenuPanel>
			</Menu>

			<Modal open={characterModalOpen} onOpenChange={setCharacterModalOpen}>
				{characterModalId && (
					<CharacterEditorModalContent characterId={characterModalId} />
				)}
			</Modal>
		</>
	)
}

function CharacterEditorModalContent({
	characterId,
}: {
	characterId: Id<"characters">
}) {
	const character = useQuery(api.characters.get, { id: characterId })
	const [loading, setLoading] = useState(false)

	return (
		<ModalContent>
			<ModalHeader>
				<ModalTitle>
					{character ? (
						<span
							className={css({ flex: 1, opacity: character.name ? 1 : 0.75 })}
						>
							{character.name || "Unnamed"}
						</span>
					) : (
						<Spinner size={5} />
					)}
				</ModalTitle>
				<Spinner
					size={5}
					style={{ opacity: loading ? 1 : 0 }}
					className={css({ transition: "opacity" })}
				/>
			</ModalHeader>
			<div className={css({ p: 4 })}>
				<Suspense fallback={<Spinner size={8} />}>
					<CharacterEditor
						characterId={characterId}
						onLoadingChange={setLoading}
					/>
				</Suspense>
			</div>
		</ModalContent>
	)
}
