import { type SuspenseResource } from "~/helpers/suspense-resource"

export function SuspenseImage({
  resource,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"img">, "src" | "resource"> & {
  resource: SuspenseResource<string>
}) {
  return <img {...props} src={resource.read()} alt={props.alt} />
}
