"use client";

import { useSpring, animated, config } from "@react-spring/web";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
    count: number;
    className?: string;
}

/**
 * Bouncy react-spring counter badge — pops when the count changes.
 * Used on the cart icon in the navbar.
 */
export function AnimatedCartCounter({ count, className = "" }: AnimatedCounterProps) {
    const prevCount = useRef(count);

    // Scale spring — bounces when count changes
    const [scaleStyle, scaleApi] = useSpring(() => ({
        transform: "scale(1)",
        config: config.wobbly,
    }));

    // Number spring — animates the displayed value
    const numberSpring = useSpring({
        val: count,
        from: { val: prevCount.current },
        config: { tension: 300, friction: 20 },
    });

    useEffect(() => {
        if (count !== prevCount.current) {
            // Trigger bounce
            scaleApi.start({
                from: { transform: "scale(1.5)" },
                to: { transform: "scale(1)" },
                config: config.wobbly,
            });
            prevCount.current = count;
        }
    }, [count, scaleApi]);

    if (count === 0) return null;

    return (
        <animated.span
            style={scaleStyle}
            className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ${className}`}
        >
            <animated.span>
                {numberSpring.val.to((v) => Math.round(v))}
            </animated.span>
        </animated.span>
    );
}
