# odin-nodejs-file-uploader

https://www.theodinproject.com/lessons/nodejs-file-uploader

## Packages and Services Used

- Node
- Express
- EJS for the view engine
- Postgresql for the relational database
- Prisma for the object relational mapper
- SASS for more convenient CSS styling
- Passport for authentication
- Supabase for file storage/content delivery network
- As well as the usual prettier and eslint combo that I use on every project

## Challenges

### User Session Data Storage

When switching from local multer storage to Supabase, I wanted each user to only be able to access their own folder in the bucket. For this to work, I would have needed to move the authentication over from Passport JS to Supabase authentication. And if I'm using the Supabase database for that, I may as well use it for everything else, right? So I spent some time trying to make that work, but could not figure out how to get the Supabase authentication to work with express-session. Express-session uses a table on the database to store session data, and it is handily loaded onto the express request object. I used this in the project to keep form data and error messages upon the submission of invalid forms, to provide error info to the user and stop the form getting cleared out every time the user tried to submit it. There is nothing more annoying than submitting a form with numerous fields, for it to fail and clear everything out just because a single field failed to validate. Without being able to save the req.session data, I would have not been able to preserve this data between requests. 

My failure to implement this, I think, stems from my lack of understanding how JSON web tokens work. With standard cookies and express-session, the user's session data is stored on the server and all that the client knows about is the user's id, stored in a cookie. However it seems that with JWTs, the user data is encoded as part of the JWT and stored on the client, not the server. Due to time constraints I decided to stick with express-session and not do any database level authentication - in any case, a user would only be able to access another user's file if they could get their hands on a public link to the file on supabase. No public urls are exposed at any point in the application. However, theoretically if someone could guess one of the Supabase file urls correctly, there would be no stopping them from accessing it, which in a real application would be unnacceptable.

### Share Links

This is another feature I dropped since I spent too much time on it.

My application routes go something like this: /folder/:folderId and /file/:fileId. Getting a user to access a shared folder is easy - just check if a share link exists for that folder - but allowing a user to access all the folders and files within that shared folder, recursively?

My approach was to create a share link (i.e. /share/:shareId) for the main folder being shared and a share link for every folder in that folder, recursively, all pointing to the main share link so they can all be deleted together once the main share link expires/is revoked. Upon following the share link, it would grant the user access to all the folders relating to it, and redirect to the main folder being shared. The views can be changed to add/remove create/rename/delete options depending on whether the user owns the folder/file. The big problem is, how do you ensure the user can navigate all the child subfolders and files? 

The options seemed to be, recursively check whether there is a share link to the folder the user is trying to access (if the folder has not been shared, then check the parent folder, and the parent's parent, etc. etc.), but that sounds incredibly wasteful and slow. Imagine you are 20 folders deep and it has to check all the parents before finding the topmost folder has been shared, and determining you are allowed access. The other approach was to create a list of folders (and all subfolders) that are associated with the share link. In effect, all the recursive work would be dealt with once and saved to a table, when the share link is created - instead of every time a user tries to access a folder that has been shared. A simple query would suffice: is there a share link that relates to this folder? Maybe checking file access should just have been as simple as checking whether its parent folder has been shared. Nothing recursive or wasteful there, just a simple query. 

In hindsight, this is really what I should have done. Maybe I will have another crack at it tomorrow.

## To Do

- Learn about JWTs and how to use them.
- Practice WITH RECURSIVE psql queries to hopefully crystallise that knowledge (the syntax is a little weird).

## Stuff That Went Well

- Using BEM (block, element, modifier) naming scheme for CSS classes is unexpectedly great. It was easier to find classes I wanted to modify, and easier to come up with logical names for them too.
- Learning about WITH RECURSIVE postgreSQL queries was interesting - it was the first time I had to use the prisma $rawQuery. It seemed like there was no way to accomplish this with "regular" prisma, although after checking out someone else's (very nice) project (https://github.com/ikeyCos/file-uploader/blob/main/db/prisma.js) I found they wrote a smart recursive function that grabs the folder, deletes and files in it from supabase, then for each subfolder calls the same function recursively again until the folder function parameter is null. Smart! Much easier to read and usable than my recursive psql query.

## Stuff That I Learned The Hard Way

- Add the results of sass compilation (.css and .css.map files) to .gitignore and .prettierignore.
- Getting git to forget about a file that it has been tracking is a big pain so make sure all files we want to ignore are added from the start. Anything that is the result of compilation. Compiling the sass files should be part of the build process.
- Git cherry-picking seems to be more trouble than it is worth, and seemed to introduce lots of merge conflicts (this is either a result of cherry-picking or some other stupid stuff I did, but the only thing I did differently with git this time was try out cherry-picking commits to grab fixes for stuff outside the scope of the feature branch and plop directly onto the main branch).
- Use res.on('finish', callback) to do stuff after res.send() has been called - do not try to alter req or res by other means like calling next() and moving onto another piece of middleware as that did not work reliably.
