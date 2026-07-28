import { cn } from "@/lib/utils";

/*
 * shadcn Skeleton, rebuilt on this project's tokens.
 *
 * As generated it was `bg-muted`, which is a shadcn CSS variable and this
 * project defines none of them - shadcn's init never ran here, so globals.css
 * is hand-built (see button.tsx and sheet.tsx for the same rebuild). Shipped as
 * generated the block would have had no background at all and the skeleton
 * would have been invisible.
 *
 * ink/10 rather than one of the creams: a skeleton has to sit clearly BELOW the
 * surface it stands on, and the surfaces here are cream and cream-light, which
 * are four values apart. Mixing the page's ink into whatever is behind it puts
 * the block underneath any of them.
 *
 * motion-reduce:animate-none because `animate-pulse` is a Tailwind built-in and
 * does not check the preference on its own, and every other animated thing on
 * this page degrades to static.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-ink/10 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
