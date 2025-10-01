# vite-plugin-svelte-bug-1186

In the root of this repository, run
> npm i

> npm run dev

After the build is done you will see:

```txt
../../wwwroot/dist-v3/build/inspectionv3.css   0.05 kB
../../wwwroot/dist-v3/build/inspectionv3.js   46.45 kB │ map: 226.25 kB
built in 596ms.
```

Now, to replicate the issue I mentioned about `postcss`, just save again the svelte file `App/inspection.svelte`.
NB. In Windows and VS Code I don't need to make any changes to the file to trigger the error, just saving the same file again.

In the console you will get this error:

```txt
build started...
✓ 0 modules transformed.
[commonjs] [postcss] <omit>/App/inspection.svelte?svelte&type=style&lang.css:1:1: Unknown word <p>Hi</p>
file: <omit>/App/inspection.svelte?svelte&type=style&lang.css:1:0
```

It looks like the line

```scss
@import './scss/_variables';
```

is what it triggers the issue. I tried to comment it, but it still fails. Instead, deleteing the line, it works fine again.
