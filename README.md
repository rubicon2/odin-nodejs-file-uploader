# odin-nodejs-file-uploader

https://www.theodinproject.com/lessons/nodejs-file-uploader

## Stuff That I Learned The Hard Way

- Add the results of sass compilation (.css and .css.map files) to .gitignore and .prettierignore
- Getting git to forget about a file that it has been tracking is a big pain so make sure all files we want to ignore are added from the start. Anything that is the result of compilation. Compiling the sass files should be part of the build process
- Git cherry-picking seems to be more trouble than it is worth, and seemed to introduce lots of merge conflicts (this is either a result of cherry-picking or some other stupid stuff I did, but the only thing I did differently with git this time was try out cherry-picking commits to grab fixes for stuff outside the scope of the feature branch and plop directly onto the main branch)
- Use res.on('finish', callback) to do stuff after res.send() has been called - do not try to alter req or res by other means like calling next() and moving onto another piece of middleware as that did not work reliably