import { LucideDices, LucideHexagon } from "lucide-react"
import type { CSSProperties, ReactElement } from "react"
import { useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { css } from "styled-system/css"
import { center, flex, grid } from "styled-system/patterns"
import { token } from "styled-system/tokens"
import { Counter } from "~/components/Counter"
import { Field } from "~/components/Field"
import { MenuItem } from "~/components/Menu"
import { Popover, PopoverButton, PopoverPanel } from "~/components/Popover"
import { Select } from "~/components/Select"
import { button } from "~/styles/button"

const range = (length: number) => [...Array(length).keys()]

const randomRange = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min

const views = [
	{ id: "action", name: "Action", component: ActionDiceForm },
	{ id: "fortune", name: "Fortune", component: () => <></> },
	{ id: "other", name: "Other", component: () => <></> },
] as const
type View = (typeof views)[number]

const rolls = range(100).map((key) => ({
	key,
	label: `Roll ${key + 1}`,
	rolledBy: "Player",
	dice: range(randomRange(1, 8)).map(() => ({
		sides: 6,
		result: randomRange(1, 6),
	})),
	displayType: "highestWithCrit" as "highestWithCrit" | "lowest" | "normal",
}))
type Roll = (typeof rolls)[number]

export function DiceMenu({ children }: { children: ReactElement }) {
	const [viewId, setViewId] = useState<View["id"]>(views[0].id)
	const currentView = views.find((v) => v.id === viewId) ?? views[0]
	return (
		<Popover>
			<PopoverButton asChild>{children}</PopoverButton>
			<PopoverPanel side="top" align="center">
				<div
					className={css({
						display: "flex",
						flexDirection: "column",
						w: 64,
						h: "min(calc(100vh - 8rem), 720px)",
						divideY: "1px",
						divideColor: "base.700",
					})}
				>
					<div className={css({ flex: 1 })}>
						<Virtuoso
							data={rolls}
							computeItemKey={(index, item) => item.key}
							itemContent={(index, roll) => (
								<div
									className={css({
										borderTopWidth: index === 0 ? 0 : 1,
										borderColor: "base.700",
									})}
								>
									<RollDetails roll={roll} />
								</div>
							)}
							initialTopMostItemIndex={rolls.length - 1}
							alignToBottom
							followOutput
						/>
					</div>

					<currentView.component />

					<div
						className={grid({
							gap: 0,
							gridAutoFlow: "column",
							gridAutoColumns: "fr",
						})}
					>
						{views.map((view) => (
							<button
								key={view.id}
								type="button"
								className={css({
									lineHeight: 1,
									p: 2,
									fontSize: "sm",
									fontWeight: "medium",
									transition: "common",
									bg: view === currentView ? "base.700" : undefined,
									_hover: { color: "accent.400" },
								})}
								onClick={() => setViewId(view.id)}
							>
								{view.name}
							</button>
						))}
					</div>
				</div>
			</PopoverPanel>
		</Popover>
	)
}

function RollDetails({ roll }: { roll: Roll }) {
	const getDieColor = (index: number, result: number) => {
		if (roll.displayType === "normal") return undefined

		if (roll.displayType === "lowest") {
			if (index < roll.dice.length - 1) return undefined
			if (result === 6) return token("colors.green.400")
			if (result >= 4) return token("colors.yellow.400")
			return token("colors.red.400")
		}

		if (index >= 2) return
		if (index === 1) return result === 6 ? token("colors.green.400") : undefined
		if (index === 0 && result === 6) return token("colors.green.400")
		if (index === 0 && result >= 4) return token("colors.yellow.400")
		return token("colors.red.400")
	}

	return (
		<div className={flex({ p: 2, direction: "column", gap: 1 })}>
			<p>{roll.label}</p>
			<ul className={flex({ rowGap: 1, columnGap: 0.5, flexWrap: "wrap" })}>
				{roll.dice
					.toSorted((a, b) => b.result - a.result)
					.map((die, index) => (
						<li
							key={index}
							style={
								{ "--color": getDieColor(index, die.result) } as CSSProperties
							}
							className={center({ pos: "relative", color: "var(--color)" })}
						>
							<LucideHexagon size={40} strokeWidth={1} />
							<p
								className={css({
									pos: "absolute",
									transform: `translateY(1px)`,
								})}
							>
								{die.result}
							</p>
						</li>
					))}
			</ul>
			<p className={css({ fontSize: "sm" })}>
				<span className={css({ color: "base.400" })}>Rolled by</span>{" "}
				{roll.rolledBy}{" "}
				{roll.displayType === "lowest" && (
					<span className={css({ color: "base.400" })}>(disadvantage)</span>
				)}
			</p>
		</div>
	)
}

function ActionDiceForm() {
	return (
		<div className={flex({ direction: "column", p: 2, gap: 2 })}>
			<div className={grid({ gridTemplateColumns: 2, gap: 2 })}>
				<Field label="Action">
					<Select label="Actions">
						<MenuItem>Move</MenuItem>
						<MenuItem>Finesse</MenuItem>
						<MenuItem>Endure</MenuItem>
						<MenuItem>Recall</MenuItem>
						<MenuItem>Move</MenuItem>
						<MenuItem>Finesse</MenuItem>
						<MenuItem>Endure</MenuItem>
						<MenuItem>Recall</MenuItem>
						<MenuItem>Move</MenuItem>
						<MenuItem>Finesse</MenuItem>
						<MenuItem>Endure</MenuItem>
						<MenuItem>Recall</MenuItem>
					</Select>
				</Field>
				<Field label="Modifier">
					<Counter />
				</Field>
			</div>
			<hr
				className={css({
					borderBottom: "none",
					borderTopWidth: 1,
					borderColor: "base.700",
				})}
			/>
			<button type="button" className={button({ align: "start" })}>
				<LucideDices /> Roll
			</button>
			<button type="button" className={button({ align: "start" })}>
				<LucideDices /> Roll (Push Yourself)
			</button>
		</div>
	)
}
