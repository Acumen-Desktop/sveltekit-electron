# Monaco Editor

## Installing

```
> npm install monaco-editor
```

You will get:

- inside `/esm`: ESM version of the editor (compatible with e.g. webpack)
- inside `/dev`: AMD bundled, not minified
- inside `/min`: AMD bundled, and minified
- inside `/min-maps`: source maps for `min`
- `monaco.d.ts`: this specifies the API of the editor (this is what is actually versioned, everything else is considered private and might break with any release).

It is recommended to develop against the `dev` version, and in production to use the `min` version.

## Concepts

Monaco editor is best known for being the text editor that powers VS Code. However, it's a bit more nuanced. Some basic understanding about the underlying concepts is needed to use Monaco editor effectively.

### Models

Models are at the heart of Monaco editor. It's what you interact with when managing content. A model represents a file that has been opened. This could represent a file that exists on a file system, but it doesn't have to. For example, the model holds the text content, determines the language of the content, and tracks the edit history of the content.

### URIs

Each model is identified by a URI. This is why it's not possible for two models to have the same URI. Ideally when you represent content in Monaco editor, you should think of a virtual file system that matches the files your users are editing. For example, you could use `file:///` as a base path. If a model is created without a URI, its URI will be `inmemory://model/1`. The number increases as more models are created.

### Editors

An editor is a user facing view of the model. This is what gets attached to the DOM and what your users see visually. Typical editor operations are displaying a model, managing the view state, or executing actions or commands.

### Providers

Providers provide smart editor features. For example, this includes completion and hover information. It is not the same as, but often maps to [language server protocol](https://microsoft.github.io/language-server-protocol) features.

Providers work on models. Some smart features depends on the file URI. For example, for TypeScript to resolve imports, or for JSON IntelliSense to determine which JSON schema to apply to which model. So it's important to choose proper model URIs.

### Disposables

Many Monaco related objects often implement the `.dispose()` method. This method is intended to perform cleanups when a resource is no longer needed. For example, calling `model.dispose()` will unregister it, freeing up the URI for a new model. Editors should be disposed to free up resources and remove their model listeners.

## Documentation

- Learn how to integrate the editor with these [complete samples](./samples/).
  - [Integrate the AMD version](./docs/integrate-amd.md).
  - [Integrate the ESM version](./docs/integrate-esm.md)
- Learn how to use the editor API and try out your own customizations in the [playground](https://microsoft.github.io/monaco-editor/playground.html).
- Explore the [API docs](https://microsoft.github.io/monaco-editor/docs.html) or read them straight from [`monaco.d.ts`](https://github.com/microsoft/monaco-editor/blob/gh-pages/node_modules/monaco-editor/monaco.d.ts).
- Read [this guide](https://github.com/microsoft/monaco-editor/wiki/Accessibility-Guide-for-Integrators) to ensure the editor is accessible to all your users!
- Create a Monarch tokenizer for a new programming language [in the Monarch playground](https://microsoft.github.io/monaco-editor/monarch.html).
- Ask questions on [StackOverflow](https://stackoverflow.com/questions/tagged/monaco-editor)! Search open and closed issues, there are a lot of tips in there!

## FAQ

> Note: If the extension is fully based on the [LSP](https://microsoft.github.io/language-server-protocol/) and if the language server is authored in JavaScript, then it would be possible.

❓ **Why all these web workers and why should I care?**

Language services create web workers to compute heavy stuff outside of the UI thread. They cost hardly anything in terms of resource overhead and you shouldn't worry too much about them, as long as you get them to work (see above the cross-domain case).

❓ **What is this `loader.js`? Can I use `require.js`?**

It is an AMD loader that we use in VS Code. Yes.

❓ **I see the warning "Could not create web worker". What should I do?**

HTML5 does not allow pages loaded on `file://` to create web workers. Please load the editor with a web server on `http://` or `https://` schemes.

## Contributing / Local Development

We are welcoming contributions from the community!
Please see [CONTRIBUTING](./CONTRIBUTING.md) for details how you can contribute effectively, how you can run the editor from sources and how you can debug and fix issues.

### Using Vite

Adding monaco editor to [Vite](https://vitejs.dev/) is simple since it has built-in support for web workers. You only need to implement the `getWorker` function (NOT the `getWorkerUrl`) to use Vite's output ([Source](https://github.com/vitejs/vite/discussions/1791#discussioncomment-321046)):

```js
import * as monaco from 'monaco-editor';

self.MonacoEnvironment = {
	getWorker: function (workerId, label) {
		const getWorkerModule = (moduleUrl, label) => {
			return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl), {
				name: label,
				type: 'module'
			});
		};

		switch (label) {
			case 'json':
				return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
			case 'css':
			case 'scss':
			case 'less':
				return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker?worker', label);
			case 'html':
			case 'handlebars':
			case 'razor':
				return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker?worker', label);
			case 'typescript':
			case 'javascript':
				return getWorkerModule('/monaco-editor/esm/vs/language/typescript/ts.worker?worker', label);
			default:
				return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker?worker', label);
		}
	}
};

monaco.editor.create(document.getElementById('container'), {
	value: "function hello() {\n\talert('Hello world!');\n}",
	language: 'javascript'
});
```
