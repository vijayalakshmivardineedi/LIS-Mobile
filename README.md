# livinSync

//Apk Buliding

npx expo-doctor //this command is to check the sdk versions and dependencies errors

npx expo prebuild  ///to get the android floder to bulid

eas build --platform android //to bulid the project

git remove remote
git remote -v
git remote remove origin
git remote add origin https://github.com/Truinfo/LIS.git
git remote set-url origin https://github.com/Truinfo/LIS.git
git remote -v
git push --set-upstream origin main