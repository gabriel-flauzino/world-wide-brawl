import gsap from "gsap";
import { Container } from "pixi.js";

/**
 * 
 * @param {Container} listener 
 * @param {Container} target 
 */
export function addClickAnimation(listener, target = listener) {
    listener.on("pointerdown", () => {
        if (listener.disabled)
            return;

        let changes = { scale: 1 };
        let tween = gsap.to(changes, {
            scale: 0.95,
            duration: 0.1,
            onUpdate() {
                if (target.destroyed)
                    return;
                target.scale.set(changes.scale);
            }
        });

        listener.once("pointerout", () => {
            tween.kill();
            target.scale.set(1);
            listener.removeEventListener("pointerup", pointerup);
        })

        listener.once("pointerup", pointerup);

        async function pointerup() {
            tween.kill();
            gsap.to(changes, {
                scale: 1,
                duration: 0.2,
                ease: "back.out(10)",
                onUpdate() {
                    if (target.destroyed)
                        return;
                    target.scale.set(changes.scale);
                }
            });
        }
    })
}