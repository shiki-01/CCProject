import { writable, type Writable } from "svelte/store";

const routeStore: Writable<string> = writable("/");

export { routeStore };