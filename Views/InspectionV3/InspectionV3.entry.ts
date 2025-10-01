/// <reference types="svelte" />
import App from '../../App/inspection.svelte';
import { mount } from "svelte";

//@ts-ignore: not supported by Svelte
export default mount(App, { target: <Element>document.querySelector('body') });
