# Po meste

React Native Expo app. Mobility, public transport and multimodal planner for Bratislava.

This project is led by the [Department of Innovation and Technology of the City of Bratislava](https://inovacie.bratislava.sk). We’re making it open-source as we believe this promotes [savings, collaboration, auditability and innovation](https://publiccode.eu) in the public sector.

Our goal is to be transparent about services we’re developing and providing, as well as to invite other cities and municipalities to build on top of the same or similar open-source technologies we’ve already tested and used - to foster an ecosystem of collaboration between teams facing similar challenges. We’ll be happy to [get in touch.](mailto:innovationteam@bratislava.sk)

> If you are an individual or a company who’d like to take part in these efforts, collaborate closely on development or report an issue, we’d love to hear from you! 🙌 Contact us using this repository or at innovationteam@bratislava.sk

## Development

Install:

```
yarn
```

Run for all platforms

```
yarn start
```

This will guide you how to open it locally on iOs simulator (if available) or Android emulator (also if available). Running in web browser is possible but discouraged (react-native-mapview is still experimental in browser).

If you want to develop on your device, you can use [Expo Go](https://expo.io/client) application.

To get Env keys:

- GOOGLE_PLACES_API_KEY_UNLOCKED
  1. Log into google account inovacie.bratislava@gmail.com
  2. Proceed to console.cloud [dopravna aplikacia](https://console.cloud.google.com/google/maps-apis/credentials?pli=1&project=dopravna-aplikacia&folder=&organizationId=)
  3. When developing use `UNRESTRICTED_TEST_KEY`, when releasing, check part with release instructions for [android](#release-new-internal-android-version)/[iOS](#release-testflight-ios-version) in this readme
- GOOGLE_IOS_API_KEY
  1. Log into google account inovacie.bratislava@gmail.com
  2. Proceed to console.cloud [dopravna aplikacia](https://console.cloud.google.com/google/maps-apis/credentials?pli=1&project=dopravna-aplikacia&folder=&organizationId=)
  3. `GOOGLE_IOS_API_KEY`
- GOOGLE_ANDROID_API_KEY
  1. Log into google account inovacie.bratislava@gmail.com
  2. Proceed to console.cloud [dopravna aplikacia](https://console.cloud.google.com/google/maps-apis/credentials?pli=1&project=dopravna-aplikacia&folder=&organizationId=)
  3. `GOOGLE_ANDROID_API_KEY`
- GOOGLE_PLACES_API_KEY
  1. Log into google account inovacie.bratislava@gmail.com
  2. Proceed to console.cloud [dopravna aplikacia](https://console.cloud.google.com/google/maps-apis/credentials?pli=1&project=dopravna-aplikacia&folder=&organizationId=)
  3. `GOOGLE_PLACES_API_KEY`
- SENTRY_AUTH_TOKEN
  1. Log in to [Sentry](https://sentry.io/settings/account/api/auth-tokens/) with inovacie.bratislava@gmail.com account
  2. Proceed to Settings -> Account -> API -> Auth Tokens
  3. Get Auth token with scope: org:read, project:releases, project:write

For help reach to @mpinter (Martin Pinter) or @Balros (Adam Grund)

### Patch-package note

List of temporary patches & why they are here:

- react-native 0.69.6 - this is to make react-native-maps 0.31.1 work, which is the newest version supported by expo 0.46

### Note about GOOGLE_PLACES_API_KEY

Since we are using [this library](https://www.npmjs.com/package/react-native-google-places-autocomplete) for Places Autocomplete, we can't restrict the API key to just our bundle - this is not ideal and we may want to change it in the future. It's also the reason why all other google APIs are accessed by the iOs/Android keys, but the Places API is a separate one.

### Running on device

You need the [Expo Go](https://expo.io/client) application installed on your device. With Android you only need to scan the QR shown to you after `yarn start`. On iOs you may need access to the bratislava expo organization - ping Martin Pinter to get it.

## Fetching data

We use [React Query](https://react-query.tanstack.com) to fetch data - it's giving it's default configuration and behaviour a quick look [here](https://react-query.tanstack.com/guides/important-defaults).

Fetching with React Query looks something like the following:

```ts
const { isLoading, data, error } = useQuery('uniqueKey', fetcherFunction)
```

The first (key) param is used as the cache key - `useQuery` used in two different places with the same key should

The fetcher functions reside in `api.ts` - please use the name of the fn as the key (as long as they all reside in same file this should guarantee uniqueness) - if the resource uses a parameter (i.e. you're fetching a resource by it's id), the key should be an array with the name of the functions and all parameters used:

```ts
useQuery('getStations', getStations)
useQuery(['getStationById', id], () => getStationsById(id))
```

## Validating data

We use [yup](https://github.com/jquense/yup). Useful not only as a sanity check but also to provide you with types and autocomplete. Validations reside in `validation.ts`.

## Release

TODO separate release channels for versions

**When to bump version and when to bump just the buildNumber and versionCode ?** BuildNumber and versionCode **must** change with every build (try to keep them in sync). We up the version every time we want to distribute something new to the end user through App/Play store.

### Give new versions to testers over Expo Go

Testers can access the app here https://expo.dev/@bratislava/hybaj?release-channel=staging

On android you can just scan the QR code or follow the link, on iOs you need to be registered on Expo and added to the Bratislava organisation (Marin Pinter or Adam Grund can do that).

To publish a new version of app for testers:

```
yarn publish-staging
```

### Update apps in production without submitting to App/Play store

**Be sure you know what you are doing, running this updates the version for all live production users out in the wild**

```
yarn publish-production
```

1. `app.config.js` property `version` and `android.versionCode` and `ios.buildNumber` as well MUST be moddified
2. `yarn publish-production`

### Release new (Internal) Android version

To release new `.apk` to Play Store:

1. **Enviroment variable `GOOGLE_PLACES_API_KEY_UNLOCKED` needs to be changed to key that belongs to Android (GOOGLE_ANDROID_API_KEY)**
2. Bump `buildNumber` and `versionCode` in `app.config.js` - try keeping ios buildNumber and android versionCode in sync even if releasing to just one of the systems
3. `yarn create-production-apk` - **WARNING: THIS ALSO CAUSES ALL THE CURRENT DEPLOYMENTS TO UPDATE OVER-THE-AIR INSTANTLY BEFORE THE NATIVE BUILD, EVEN BEFORE YOU SUBMIT THE APP FOR REVIEW** - modify the command with `--no-publish` flag if you don't wish to do this
4. wait for [Expo](https://expo.dev/accounts/bratislava/projects/hybaj/builds) to build new `.apk`
5. Download produced `.apk`
6. Create new release to desired release channels, e.g. [Internal testing](https://play.google.com/console/u/1/developers/5957584533981072671/app/4975790424614272614/app-dashboard?timespan=thirtyDays)
7. Upload new `.apk`

**Note about updating the testing version on Android - Google Play store often can't see the updated version if you already downloaded an older one - what always works is to 1. uninstall the app 2. from the settings, force quit Play store 3. from the same place, clear cache and delete all app data 4. download the app again.**

### Release (TestFlight) iOs version

You need a Mac with installed XCode or [Transporter app](https://apps.apple.com/us/app/transporter/id1450874784?mt=12)

1. **Enviroment variable `GOOGLE_PLACES_API_KEY_UNLOCKED` needs to be changed to key that belongs to IOS (GOOGLE_IOS_API_KEY)**
2. Bump `buildNumber` and `versionCode` in `app.config.js` - try keeping ios buildNumber and android versionCode in sync even if releasing to just one of the systems
3. `yarn create-production-ipa` - **WARNING: THIS ALSO CAUSES ALL THE CURRENT DEPLOYMENTS TO UPDATE OVER-THE-AIR INSTANTLY BEFORE THE NATIVE BUILD, EVEN BEFORE YOU SUBMIT THE APP FOR REVIEW** - modify the command with `--no-publish` flag if you don't wish to do this
4. You will be asked to log in to your apple account and select organisation and provider - you need to have access to Bratislava apple organisation
5. wait for [Expo](https://expo.dev/accounts/bratislava/projects/hybaj/builds) to build new `.ipa`
6. Download produced `.ipa` & upload it to App Store connect using the Transporter app or XCode
7. Go to [app Testflight section](https://appstoreconnect.apple.com/apps/1599324226/testflight) and make the version available if needed - the processing usually takes up to an hour, but can get stuck for longer

## Additional info

1. When application is installed from play store, version installed is always from last `.apk` file uploaded to store, then OTA updates is applied.
2. Map won't load. If API keys are changed, they won't work until produced `.apk` is uploaded in Play store. Then google store signs new release and activate new keys. Some info in [Expo docs](https://docs.expo.dev/versions/latest/sdk/map-view/#2-have-your-apps-sha-1-certificate-fingerprint)
3. Google store id change is not possible. [Info](https://stackoverflow.com/questions/17582289/is-it-possible-to-change-the-package-name-of-an-android-app-on-google-play)
