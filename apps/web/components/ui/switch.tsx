"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(checked || false)

    React.useEffect(() => {
        if (checked !== undefined) {
            setInternalChecked(checked)
        }
    }, [checked])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const newChecked = !internalChecked
        setInternalChecked(newChecked)
        onCheckedChange?.(newChecked)
        props.onClick?.(e)
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={internalChecked}
            ref={ref}
            onClick={handleClick}
            className={cn(
                "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
                internalChecked ? "data-[state=checked]" : "data-[state=unchecked]",
                className
            )}
            {...props}
        >
            <span
                className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    internalChecked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    )
})
Switch.displayName = "Switch"

export { Switch }
