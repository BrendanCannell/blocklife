import pkg from './package.json'
import resolve from "rollup-plugin-node-resolve"
import {terser} from "rollup-plugin-terser"

export default [
	{
		input: 'src/life.js',
		output: {
			name: 'Life',
			file: pkg.browser,
			format: 'umd'
    },
    plugins: [
      resolve(),
      // terser({
      //   compress: {
      //     unsafe: true,
      //     pure_getters: true
      //   }
      // })
    ]
	},
	{
		input: 'src/life.js',
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
    ],
    plugins: [resolve()]
	}
]