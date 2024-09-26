## Redeem Code

Product unlock by applying redeem code

## Production Deployment
Download production build from [WordPress Plugin Directory](https://wordpress.org/plugins/redeem-code/).

## Development environment setup
- Open terminal at <kbd>~/wp-content/plugins/</kbd> directory
- Run <kbd>git clone https://github.com/Solidie/redeem-code.git</kbd>
- Run <kbd>cd redeem-code</kbd>
- Run <kbd>npm install</kbd>
- Run <kbd>npm run build</kbd> to compile scirpts in production mode and create releasable zip file.
- Or, Run <kbd>npm run watch</kbd> if you'd like the codes to be compiled in development mode and need continuous compilation on code changes.

If it is cloned already
- open terminal at <kbd>~wp-content/plugins/redeem-code/</kbd>
- run <kbd>git pull</kbd> 
- and then <kbd>npm run build</kbd> or <kbd>npm run watch</kbd>

Whenever you pull updates to local repository, don't forget to run <kbd>npm install</kbd> and <kbd>npm run build</kbd> or <kbd>watch</kbd> again.
