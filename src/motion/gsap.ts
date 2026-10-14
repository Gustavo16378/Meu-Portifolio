import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { Observer } from 'gsap/Observer'

// Só os plugins que o site usa: Physics2D e SplitText ficam fora até alguma seção precisar.
gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, Observer)

export { gsap, ScrollTrigger, Draggable, InertiaPlugin, Observer }
