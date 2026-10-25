# Telegram Ads API

### Making requests

All queries to the Telegram Ads API must be served over HTTPS and need to be presented in this form: `https://promoteapi.telegram.org/METHOD_NAME`. Like this for example:

```
https://promoteapi.telegram.org/getCurrentAccount
```

We support **GET** and **POST** HTTP methods. We support three ways of passing parameters in Ads API requests:

- [URL query string](https://en.wikipedia.org/wiki/Query_string)
- application/x-www-form-urlencoded
- application/json (except for uploading files)
- multipart/form-data (use to upload files)

The response contains a JSON object, which always has a Boolean field `ok`. If `ok` equals _true_, the request was successful, and the result of the query can be found in the `result` field. In case of an unsuccessful request, `ok` equals _false_, and the error is explained in the `error` field (e.g. AD\_TITLE\_REQUIRED).

- All methods in the Ads API are case-insensitive.
- All queries must be made using UTF-8.

### Idempotent Requests

The Telegram Ads API supports idempotency for safely retrying requests without accidentally performing the same operation twice. To perform an idempotent request, provide an idempotency key in one of two ways:

- in the HTTP header `Idempotency-Key: <key>`
- as the `idempotency_key` parameter.

An idempotency key is a client-generated unique value that lets the server identify repeat requests. While you can choose how to create these keys, we recommend using a v4 UUIDs or other high-entropy strings to avoid collisions. Idempotency keys can be up to 128 characters long.

For idempotent requests, the API saves the body of the response of the initial request and, when the same idempotency key is used in another request, it replays the saved response.

> Keys older than 24 hours will be deleted. You can safely retry requests that include an idempotency key as long as the second request occurs within 24 hours from the initial request.

A response is only saved if an API method started executing. If incoming parameters failed validation, or the request conflicted with another that was executing concurrently, no idempotent result is saved. It is safe to retry these requests.

When using an idempotency key, the request parameters must match the initial request. Otherwise, an `IDEMPOTENT_PARAM_MISMATCH` error will be returned. If the initial request is still being processed concurrently and has not yet responded, an `IDEMPOTENT_REQUEST_IN_PROGRESS` error will be returned.

When the response is replayed, the HTTP header `Idempotent-Replayed: true` will be added to the response.

### Authorization

Before invoking API methods, it's necessary to obtain an access token in the Telegram Ads account settings. After this, any requests to the API can be executed.

The token must be passed in every request in one of two ways:

- in the HTTP header: `Authorization: Bearer <token>`
- as the `access_token` parameter.

### Currencies

Each account is denominated in one of the supported currencies: Euros (“EUR”), Grams (“TON”) or Telegram Stars (“XTR”). The currency is assigned when the account is created and cannot be changed.

| Currency | Code | _cpm_ & budget precision | _amount_ precision |
| --- | --- | --- | --- |
| Euros | EUR | 2 | 5 |
| Grams | TON | 2 | 5 |
| Telegram Stars | XTR | 0 | 3 |

All monetary fields in the API – budgets, prices and transaction amounts – are expressed in the account's currency. The currency of the current account is returned in the _currency_ field of the [Account](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#account) object and of all objects containing monetary values.

### Resolving channels and bots

Channels and bots can be specified either by their numeric identifier or by their username (in the format `@channelusername`) in the _channel\_id_ / _bot\_id_ parameters of the [getTargetChannel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargetchannel) and [getTargetBot](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargetbot) methods, as well as in the _channel\_ids_ and _bot\_ids_ target fields of the [createAd](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#createad) and [editAd](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#editad) methods.

Numeric identifiers of channels and bots can only be used if they were previously resolved by the same account via their username. Otherwise, a `CHANNEL_ID_UNKNOWN` or `BOT_ID_UNKNOWN` error is returned. Because of this, specifying channels and bots by username is the recommended default.

### Available methods

> We support **GET** and **POST** HTTP methods. Use either [URL query string](https://en.wikipedia.org/wiki/Query_string) or _application/json_ or _application/x-www-form-urlencoded_ for passing parameters in Telegram Ads API requests.
>
> On successful call, a JSON-object containing the result will be returned.

#### createAccount

Use this method to create a new account. This method can only be called from the main advertiser's account. An account created in this way can only be managed through the main account from which it was created. On success, returns an [AccountInfo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accountinfo) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| title | String | Yes | Title of the account is being created, 1-128 characters. |
| full\_name | String | Yes | Full company name for which the account is being created, 1-256 characters. |
| email | String | Yes | Company email for which the account is being created, 1-64 characters. |
| phone\_number | String | Yes | Phone number of the company for which the account is being created. |
| country | String | Yes | Company's country for which the account is being created, 1-128 characters. |
| city | String | Yes | Company's city for which the account is being created, 1-128 characters. |
| legal\_name | String | Optional | Advertiser's legal name for which the account is being created, 0-256 characters. Additional information that can be viewed by users. |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### editAccountInfo

Use this method to edit the info of the account. On success, returns an [AccountInfo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accountinfo) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to edit info. If not specified, the current account will be used. |
| title | String | Optional | New title of the account, 1-128 characters. |
| full\_name | String | Optional | New full company name of the account, 1-256 characters. |
| email | String | Optional | New company email of the account, 1-64 characters. |
| phone\_number | String | Optional | New phone number of the company of the account. |
| country | String | Optional | New company's country of the account, 1-128 characters. |
| city | String | Optional | New company's city of the account, 1-128 characters. |
| legal\_name | String | Optional | New advertiser's legal name of the account, 0-256 characters. |

#### getAccountInfo

Use this method to get the info of the account. On success, returns an [AccountInfo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accountinfo) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get info. If not specified, the current account will be used. |

#### getRelatedAccountsList

Use this method to get a list of related accounts. Budgets of related accounts can be replenished using the budget of the main account. On success, returns a [RelatedAccountsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#relatedaccountslist) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| offset | Integer | Optional | Offset of the related accounts list to be returned. |
| limit | Integer | Optional | Limits the number of the related accounts to be retrieved. By default, all related accounts are returned. |

#### increaseAccountBudget

Use this method to increase the budget of a related account. The current account budget must have enough funds. On success, returns a [TransactionStatus](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#transactionstatus) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Yes | Unique identifier of the account to increase budget. |
| amount | Float | Yes | Amount in the account's currency that will be added to the account budget from the current account budget. The value will be rounded to the amount precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### decreaseAccountBudget

Use this method to decrease the budget of a related account. The target account budget must have enough funds. On success, returns a [TransactionStatus](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#transactionstatus) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Yes | Unique identifier of the account to decrease budget. |
| amount | Float | Yes | Amount in the account's currency that will be withdrawn from the account budget to the current account budget. The value will be rounded to the amount precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### getTransactionStatus

Use this method to get the status of transaction. On success, returns a [TransactionStatus](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#transactionstatus) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| transaction\_id | String | Yes | Unique identifier of the transaction to get status. |

#### getCurrentAccount

Use this method to get the current account. Requires no parameters. On success, returns an [Account](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#account) object.

#### getAccountsById

Use this method to get accounts by their identifiers. On success, an array of [Account](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#account) objects is returned.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_ids | Array of String | Yes | A JSON-serialized list of account identifiers. |

#### getAccountTransactionsList

Use this method to get a list of transactions related to an account. On success, returns an [AccountTransactionsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accounttransactionslist) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account whose transaction list will be returned. If not specified, the current account will be used. |
| offset | Integer | Optional | Offset of the transaction list to be returned. |
| limit | Integer | Optional | Limits the number of transactions to be retrieved. Defaults to 100. |

#### getAccountStats

Use this method to get statistics related to the account. On success, returns an array of [AdStatItem](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adstatitem) objects.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get statistics. If not specified, the current account will be used. |
| from\_time | Integer | Yes | Start of the period, in Unix time. It will be rounded to the start of the interval. The start point is included in the result. The period should not be longer than 1000\*interval. |
| to\_time | Integer | Yes | End of the period, in Unix time. It will be rounded to the start of the interval. The end point is not included in the result. The period should not be longer than 1000\*interval. |
| interval | Integer | Yes | Interval in seconds, can be either _300_ (5 min) or _86400_ (1 day). |

#### getAccountReport

Use this method to get a report of the active advertisements for the account. On success, returns an array of [AccountReportItem](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accountreportitem) objects.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get a report. If not specified, the current account will be used. |
| year | Integer | Yes | Year of the report, 2021-2100. |
| month | Integer | Yes | Month of the report, 1-12. |

#### uploadAdPhoto

Use this method to upload a photo to be displayed in the advertisement. On success, returns an [AdPhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adphoto) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to upload the photo. If not specified, the current account will be used. |
| file | [InputFile](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputfile) | Yes | Photo to upload. The photo should be in JPEG or PNG format, up to 5 MB in size, and at least 640 pixels in width with a 16:9 aspect ratio. |

#### uploadAdVideo

Use this method to upload a video to be displayed in the advertisement. On success, returns an [AdVideo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#advideo) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to upload the video. If not specified, the current account will be used. |
| file | [InputFile](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputfile) | Yes | Video to upload. The video should be in MP4 format, up to 20 MB in size, at least 640 pixels in width with a 16:9 aspect ratio, and with a duration between 3 and 60 seconds. |

#### uploadWebsitePhoto

Use this method to upload a photo of the website you want to promote. On success, returns an [WebsitePhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#websitephoto) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to upload a photo of the website. If not specified, the current account will be used. |
| file | [InputFile](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputfile) | Yes | Photo to upload. The photo should be in JPEG or PNG format, up to 1 MB in size, and at least 150x150 pixels in dimensions. |

#### createAd

Use this method to create a new advertisement. On success, returns an [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to create an ad. If not specified, the current account will be used. |
| title | String | Yes | New ad title, 1-128 bytes. Only displayed in the Telegram Ads interface. |
| text | String | Optional | Text of the advertisement, 1-160 characters. This is what your target audience will see. Required for all targeting types except _search_. |
| photo\_id | String | Optional | Unique identifier of the uploaded photo to be displayed in the advertisement. To upload a photo, use the [uploadAdPhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#uploadadphoto) method. On average, ads with a photo require a 50-80% higher CPM to be displayed. Applicable for targeting types _channels_ or _users_ only. Only one of _photo\_id_ or _video\_id_ can be used. |
| video\_id | String | Optional | Unique identifier of the uploaded video to be displayed in the advertisement. To upload a video, use the [uploadAdVideo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#uploadadvideo) method. On average, ads with a video require a 70-100% higher CPM to be displayed. Applicable for targeting types _channels_ or _users_ only. Only one of _video\_id_ or _photo\_id_ can be used. |
| promote\_url | String | Yes | A valid URL of the channel, post, bot or website you want to promote, 1-256 characters. The button below the ad will open this link. |
| cpm | Float | Yes | The price per 1000 impressions in the account's currency. The value will be rounded to the cpm & budget precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). The minimum value depends on the account's currency and other advertisement parameters. |
| placement | String | Yes | Placement of the advertisement. Must be one of “channel\_post”, “bot\_banner”, “search\_result” or “video\_banner”. This field determines where the ad will be shown.<br>While currently optional for backward compatibility – if not specified, the value will be inferred from _target.type_ – **it is strongly recommended to always provide this field explicitly**, as missing _placement_ may lead to errors in future versions. |
| target | [InputAdTarget](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputadtarget) | Yes | Target settings. |
| impression\_frequency | Integer | Optional | Frequency of ad impressions to a single user per day, 1-4. Defaults to 1. |
| website\_name | String | Optional | Name of the website you want to promote, 1-40 characters. Required if the URL you want to promote is an external link. |
| website\_photo\_id | String | Optional | Unique identifier of the uploaded photo of the website you want to promote. To upload a photo, use the [uploadWebsitePhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#uploadwebsitephoto) method. |
| button | String | Optional | Type of the button to be displayed in the advertisement. Applicable only if the URL you want to promote is an external link. Can be either “subscribe”, “view”, “read”, “learn\_more”, “download”, “open”, “sign\_up”, “buy”, “order”, “play”, “try” or “leave\_request”. If empty, the default button labeled “Open Website” will be displayed. |
| conversion\_event\_id | String | Optional | A pixel event used to track conversions. Applicable only if the URL you want to promote is an external link. |
| additional\_info | String | Optional | Additional information that can be viewed by users, 0-64 characters. This information can be viewed by users only if the _legal\_name_ field is filled in the [AccountInfo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accountinfo). |
| show\_userpic | Boolean | Optional | Pass _True_ if the advertisement should contain a picture of the promoted channel or bot. On average, ads with a picture require a 30% higher CPM to be displayed. |
| initial\_budget | Float | Optional | Amount in the account's currency that will be added to the ad budget from the account budget. The account budget must have enough funds. The value will be rounded to the cpm & budget precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). Defaults to 0. |
| daily\_budget\_limit | Float | Optional | Amount limit in the account's currency that can be spent daily. If 0, the limit is not applied. The value will be rounded to the cpm & budget precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). Defaults to 0. |
| is\_paused | Boolean | Optional | Pass _True_ if the advertisement should remain on hold after creation. Ignored if _activate\_date_ or _deactivate\_date_ are passed. |
| activate\_date | Integer | Optional | Date in Unix time when the advertisement will be activated. It will be rounded to the start of a minute. The date should be later than the current time but not more than 365 days from the current time. If passed, _is\_paused_ will be set to _True_ if the value is in the future, otherwise, _is\_paused_ will be set to _False_. |
| deactivate\_date | Integer | Optional | Date in Unix time when the advertisement will be paused. It will be rounded to the start of a minute. The date should be later than the current time but not more than 365 days from the current time. If passed, _is\_paused_ will be set to _False_ if the value is in the future and _activate\_date_ is not set, otherwise, _is\_paused_ will be set to _True_. |
| schedule | [InputAdSchedule](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputadschedule) | Optional | Schedule for displaying the advertisement by hours. |
| return\_target | Boolean | Optional | Pass _True_ to retrieve target settings in the returned [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object. |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### editAd

Use this method to edit an existing advertisement. On success, returns an [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to edit an ad. If not specified, the current account will be used. |
| ad\_id | Integer | Yes | Unique identifier of the ad to edit. |
| title | String | Optional | New ad title, 1-128 bytes. Only displayed in the ad interface. |
| text | String | Optional | Text of the advertisement, 1-160 characters. This is what your target audience will see. |
| photo\_id | String | Optional | Unique identifier of the uploaded photo to be displayed in the advertisement. To upload a photo, use the [uploadAdPhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#uploadadphoto) method. On average, ads with a photo require a 50-80% higher CPM to be displayed. Applicable for targeting types _channels_ or _users_ only. If passed, any previously set photo or video will be removed. Only one of _photo\_id_ or _video\_id_ can be used. |
| video\_id | String | Optional | Unique identifier of the uploaded video to be displayed in the advertisement. To upload a video, use the [uploadAdVideo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#uploadadvideo) method. On average, ads with a video require a 70-100% higher CPM to be displayed. Applicable for targeting types _channels_ or _users_ only. If passed, any previously set photo or video will be removed. Only one of _video\_id_ or _photo\_id_ can be used. |
| promote\_url | String | Optional | A valid URL of the channel, post, bot or website you want to promote, 1-256 characters. The button below the ad will open this link. |
| cpm | Float | Optional | The price per 1000 impressions in the account's currency. The value will be rounded to the cpm & budget precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). The minimum value depends on the account's currency and other advertisement parameters. |
| impression\_frequency | Integer | Optional | Frequency of ad impressions to a single user per day, 1-4. Defaults to 1. |
| website\_name | String | Optional | Name of the website you want to promote, 1-40 characters. |
| website\_photo\_id | String | Optional | Unique identifier of the uploaded photo of the website you want to promote. To upload a photo, use the [uploadWebsitePhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#uploadwebsitephoto) method. |
| button | String | Optional | Type of the button to be displayed in the advertisement. Applicable only if the URL you want to promote is an external link. Can be either “subscribe”, “view”, “read”, “learn\_more”, “download”, “open”, “sign\_up”, “buy”, “order”, “play”, “try” or “leave\_request”. If empty, the default button labeled “Open Website” will be displayed. |
| conversion\_event\_id | String | Optional | A pixel event used to track conversions. Applicable only if the URL you want to promote is an external link. Can't be changed if already set. |
| additional\_info | String | Optional | Additional information that can be viewed by users, 0-64 characters. This information can be viewed by users only if the _legal\_name_ field is filled in the [AccountInfo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accountinfo). Can't be changed if already set. |
| show\_userpic | Boolean | Optional | Pass _True_ if the advertisement should contain a picture of the promoted channel or bot. On average, ads with a picture require a 30% higher CPM to be displayed. |
| daily\_budget\_limit | Float | Optional | Amount limit in the account's currency that can be spent daily. If 0, the limit is not applied. The value will be rounded to the cpm & budget precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). |
| is\_paused | Boolean | Optional | Pass _True_ if the advertisement needs to be paused. Pass _False_ if the paused advertisement needs to be resumed. If passed, previously set _activate\_date_ and _deactivate\_date_ will be reset. Ignored if _activate\_date_ or _deactivate\_date_ are passed. |
| activate\_date | Integer | Optional | Date in Unix time when the advertisement will be activated. It will be rounded to the start of a minute. The date should be later than the current time but not more than 365 days from the current time. If passed, _is\_paused_ will be set to _True_ if the value is in the future, otherwise, _is\_paused_ will be set to _False_. |
| deactivate\_date | Integer | Optional | Date in Unix time when the advertisement will be paused. It will be rounded to the start of a minute. The date should be later than the current time but not more than 365 days from the current time. If passed, _is\_paused_ will be set to _False_ if the value is in the future and _activate\_date_ is not set, otherwise, _is\_paused_ will be set to _True_. |
| schedule | [InputAdSchedule](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputadschedule) | Optional | Schedule for displaying the advertisement by hours. |
| return\_target | Boolean | Optional | Pass _True_ to retrieve target settings in the returned [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object. |

#### editAdStatus

_Deprecated._ Use method [editAd](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#editad) with parameter _is\_paused_ instead.

#### increaseAdBudget

Use this method to increase the budget of an advertisement. The account budget must have enough funds. On success, returns an [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to increase an ad budget. If not specified, the current account will be used. |
| ad\_id | Integer | Yes | Unique identifier of the advertisement to increase budget. |
| amount | Float | Yes | Amount in the account's currency that will be added to the ad budget from the account budget. The value will be rounded to the amount precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). |
| return\_target | Boolean | Optional | Pass _True_ to retrieve target settings in the returned [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object. |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### decreaseAdBudget

Use this method to decrease the budget of an advertisement. The ad budget must have enough funds. To decrease the budget of an ad, it must be inactive for at least 10 minutes. On success, returns an [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to decrease an ad budget. If not specified, the current account will be used. |
| ad\_id | Integer | Yes | Unique identifier of the advertisement whose budget should be decreased. |
| amount | Float | Yes | Amount in the account's currency that will be withdrawn from the ad budget to the account budget. The value will be rounded to the amount precision of the account's currency (see [Currencies](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#currencies)). |
| return\_target | Boolean | Optional | Pass _True_ to retrieve target settings in the returned [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object. |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### submitAdForReview

Use this method to submit an advertisement for review. Can only be used for ads with the “ready\_for\_review” status. Ads are submitted for review automatically when they are created or edited, provided the ad's budget is not empty. If an ad has the “ready\_for\_review” status, it will not be submitted for review automatically and must be submitted using this method. On success, returns an [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to submit an ad for review. If not specified, the current account will be used. |
| ad\_id | Integer | Yes | Unique identifier of the ad to submit for review. |
| return\_target | Boolean | Optional | Pass _True_ to retrieve target settings in the returned [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) object. |

#### deleteAd

Use this method to delete an existing advertisement. To delete an ad, it must be inactive for at least 10 minutes. Returns _True_ on success.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to delete an ad. If not specified, the current account will be used. |
| ad\_id | Integer | Yes | Unique identifier of the advertisement to delete. |

#### getAdsById

Use this method to get advertisements by their identifiers. On success, an array of [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) objects is returned.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get ads. If not specified, the current account will be used. |
| ad\_ids | Array of Integer | Yes | A JSON-serialized list of unique ad identifiers. |
| return\_target | Boolean | Optional | Pass _True_ to retrieve target settings in the returned [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) objects. |

#### getAdsList

Use this method to get a list of advertisements for the current account. On success, returns an [AdList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adlist) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get ads list. If not specified, the current account will be used. |
| offset | String | Optional | Offset of the ads list to be returned. |
| limit | Integer | Optional | Limits the number of ads to be retrieved. Values between 0-100 are accepted. Defaults to 100. |
| return\_target | Boolean | Optional | Pass _True_ to retrieve target settings in the returned [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) objects. |

#### getAdTransactionsList

Use this method to get a list of transactions for an advertisement. On success, returns an [AdTransactionsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtransactionslist) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get an ad transactions list. If not specified, the current account will be used. |
| ad\_id | Integer | Yes | Unique identifier of the ad whose transaction list will be returned. |
| offset | Integer | Optional | Offset of the transaction list to be returned. |
| limit | Integer | Optional | Limits the number of the transactions to be retrieved. Defaults to 100. |

#### getAdStats

Use this method to get statistics for an advertisement. On success, returns an array of [AdStatItem](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adstatitem) objects.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get an ad stats. If not specified, the current account will be used. |
| ad\_id | Integer | Yes | Unique identifier of the ad to get statistics. |
| from\_time | Integer | Yes | Start of the period, in Unix time. It will be rounded to the start of the interval. The start point is included in the result. The period should not be longer than 1000\*interval. |
| to\_time | Integer | Yes | End of the period, in Unix time. It will be rounded to the start of the interval. The end point is not included in the result. The period should not be longer than 1000\*interval. |
| interval | Integer | Yes | Interval in seconds, can be either _300_ (5 min) or _86400_ (1 day). |

#### createAudience

Use this method to create a new audience. On success, returns an [Audience](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#audience) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to create an audience. If not specified, the current account will be used. |
| title | String | Yes | New audience title, 1-64 characters. Only displayed in the Telegram Ads interface. |
| add\_phones | Array of String | Optional | List of 0-10000 phone numbers or their SHA256 hashes. |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### editAudience

Use this method to edit an existing audience. If the fields _add\_phones_ and _remove\_phones_ or _reset\_phones_ are passed simultaneously, the deletions will be performed first, followed by the addition of new ones. On success, returns an [Audience](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#audience) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to edit an audience. If not specified, the current account will be used. |
| audience\_id | Integer | Yes | Unique identifier of the audience to edit. |
| title | String | Optional | New audience title, 1-64 bytes. If not provided, the title will not be changed. |
| add\_phones | Array of String | Optional | List of 0-10000 phone numbers or their SHA256 hashes to include in the audience. |
| remove\_phones | Array of String | Optional | List of 0-10000 phone numbers or their SHA256 hashes to remove from the audience. Will be ignored if _reset\_phones_ is passed. |
| reset\_phones | Boolean | Optional | Pass _True_ to reset all phone numbers from the audience. |

#### deleteAudience

Use this method to delete an existing audience. You can only delete an audience that is not currently used in any advertisements. Returns _True_ on success.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to delele an audience. If not specified, the current account will be used. |
| audience\_id | Integer | Yes | Unique identifier of the audience to delete. |

#### getAudiencesById

Use this method to get audiences by their identifiers. On success, an array of [Audience](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#audience) objects is returned.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get audiences. If not specified, the current account will be used. |
| audience\_ids | Array of Integer | Yes | A JSON-serialized list of audience identifiers. |

#### getAudiencesList

Use this method to get the list of audiences. On success, returns an [AudiencesList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#audienceslist) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get audiences list. If not specified, the current account will be used. |
| offset | Integer | Optional | Offset of the audiences list to be returned. |
| limit | Integer | Optional | Limits the number of audiences to be retrieved. By default, all audiences are returned. |

#### createPixel

Use this method to create a Pixel Tag. On success, returns a [Pixel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#pixel) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to create a pixel. If not specified, the current account will be used. |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### getPixel

Use this method to get a Pixel Tag related to the account. On success, returns a [Pixel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#pixel) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get a pixel. If not specified, the current account will be used. |

#### createPixelEvent

Use this method to create a new pixel event. On success, returns a [PixelEvent](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#pixelevent) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to create an event. If not specified, the current account will be used. |
| title | String | Yes | New event title, 1-64 characters. Only displayed in the Telegram Ads interface. |
| type | String | Yes | Type of the event that most closely matches the action you want to track. Can be either “page\_view”, “add\_to\_cart”, “add\_to\_wishlist”, “customize\_product”, “initiate\_checkout”, “add\_payment\_info”, “purchase”, “contact”, “lead”, “schedule”, “complete\_registration”, “submit\_application”, “start\_trial”, “subscribe”, “view\_content”, “search”, “find\_location”, “donate”, “custom”. |
| idempotency\_key | String | Optional | A unique key to perform an idempotent request, 0-128 characters. You can also pass this key in the HTTP header `Idempotency-Key: <key>` instead. |

#### editPixelEvent

Use this method to edit an existing pixel event. You can't edit a pixel event that was automatically created. On success, returns a [PixelEvent](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#pixelevent) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to edit the pixel event. If not specified, the current account will be used. |
| event\_id | String | Yes | Unique identifier of the pixel event to edit. |
| title | String | Yes | New event title, 1-64 bytes. |

#### deletePixelEvent

Use this method to delete an existing pixel event. You can only delete a pixel event that is not currently used in any advertisements and was not automatically created. Returns _True_ on success.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to delete the pixel event. If not specified, the current account will be used. |
| event\_id | String | Yes | Unique identifier of the pixel event to delete. |

#### getPixelEventsById

Use this method to get pixel events by their identifiers. On success, an array of [PixelEvent](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#pixelevent) objects is returned.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get pixel events. If not specified, the current account will be used. |
| event\_ids | Array of String | Yes | A JSON-serialized list of pixel event identifiers. |

#### getPixelEventsList

Use this method to get a list of pixel events. On success, returns a [PixelEventsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#pixeleventslist) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| account\_id | String | Optional | Unique identifier of the account to get pixel events list. If not specified, the current account will be used. |
| offset | Integer | Optional | Offset of the list of pixel events to return. |
| limit | Integer | Optional | Limits the number of pixel events to be retrieved. By default, all pixel events are returned. |

#### getTargetLanguagesList

Use this method to get the list of available target languages. Requires no parameters. On success, returns an array of [TargetLanguage](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetlanguage) objects.

#### getTargetTopicsList

Use this method to get the list of available target topics. Requires no parameters. On success, returns an array of [TargetTopic](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targettopic) objects.

#### getTargetCountriesList

Use this method to get the list of available target countries. Requires no parameters. On success, returns an array of [TargetCountry](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetcountry) objects.

#### getTargetLocationsById

Use this method to get locations by their identifiers. On success, an array of [TargetLocation](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetlocation) objects is returned.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| location\_ids | Array of Integer | Yes | A JSON-serialized list of unique location identifiers. |

#### getTargetLocationsList

Use this method to get target locations. On success, returns a [TargetLocationList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetlocationlist) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| country\_code | String | Yes | Two-letter ISO 3166-1 alpha-2 country code. |
| query | String | Yes | Text of the query. |
| offset | String | Optional | Offset of the locations list to be returned. |
| limit | Integer | Optional | Limits the number of locations to be retrieved. Defaults to 100. |

#### getTargetChannel

Use this method to get target channel. On success, returns a [TargetChannel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetchannel) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| channel\_id | Integer or String | Yes | Unique identifier for the target channel or username of the target channel (in the format `@channelusername`). Numeric identifiers can only be used if they were previously resolved by this account via username (see [Resolving channels and bots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#resolving-channels-and-bots)). |
| for\_excluding | Boolean | Optional | Pass _True_ if you want to exclude the channel. |

#### getTargetBot

Use this method to get target bot. On success, returns a [TargetBot](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetbot) object.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| bot\_id | Integer or String | Yes | Unique identifier for the target bot or username of the target bot (in the format `@usernamebot`). Numeric identifiers can only be used if they were previously resolved by this account via username (see [Resolving channels and bots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#resolving-channels-and-bots)). |

### Available types

All types used in the Telegram Ads API responses are represented as JSON-objects.

It is safe to use 32-bit signed integers for storing all **Integer** fields unless otherwise noted.

> **Optional** fields may be not returned when irrelevant.

#### Account

This object represents an advertiser account.

| Field | Type | Description |
| --- | --- | --- |
| account\_id | String | Unique account identifier. |
| title | String | Title of the account. |
| currency | String | Currency of the account. Can be either “EUR”, “TON” or “XTR”. |
| spent\_budget | Float | Spent amount in the account's currency. |
| remaining\_budget | Float | Remaining amount in the account's currency. |
| ads\_budget | Float | Remaining amount in the account's currency on advertisement budgets. |

#### AccountInfo

This object represents an information of an advertiser account.

| Field | Type | Description |
| --- | --- | --- |
| account\_id | String | Unique account identifier. |
| title | String | Title of the account. |
| full\_name | String | Full company name of the account. |
| email | String | Company email of the account. |
| phone\_number | String | Phone number of the company of the account. |
| country | String | Company's country of the account. |
| city | String | Company's city of the account. |
| legal\_name | String | _Optional._ Advertiser's legal name of the account. |

#### RelatedAccountsList

This object represents a related accounts list.

| Field | Type | Description |
| --- | --- | --- |
| total\_count | Integer | Total number of related accounts. |
| accounts | Array of [Account](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#account) | List of requested related accounts. |

#### TransactionStatus

This object represents a transaction status.

| Field | Type | Description |
| --- | --- | --- |
| transaction\_id | String | Unique identifier of the transaction. |
| status | String | Status of the transaction, can be either “in\_progress”, “failed”, “completed”. |
| currency | String | Currency of the account. Can be either “EUR”, “TON” or “XTR”. |
| amount | Float | Transaction amount in the account's currency. Negative amount means withdrawal from the related account. |
| main\_account | [Account](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#account) | Current account. |
| related\_account | [Account](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#account) | Related account. |
| error | String | _Optional._ Error description in case of failed transaction (e.g. NOT\_ENOUGH\_BUDGET). |

#### AccountTransactionsList

This object represents a list of transactions related to an account.

| Field | Type | Description |
| --- | --- | --- |
| total\_count | Integer | Total number of transactions. |
| transactions | Array of [AccountTransaction](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accounttransaction) | List of requested transactions. |
| next\_offset | String | _Optional._ If present, represents the offset to receive the next portion of the transactions. |

#### AccountTransaction

This object represents an account transaction.

| Field | Type | Description |
| --- | --- | --- |
| peer | [AccountTransactionPeer](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accounttransactionpeer) | The peer involved in the transaction. |
| date | Integer | Point in time (Unix timestamp) when the transaction occurred. |
| currency | String | Currency of the account. Can be either “EUR”, “TON” or “XTR”. |
| amount | Float | Transaction amount in the account's currency. A negative amount represents a withdrawal from the account budget. |

#### AccountTransactionPeer

This object represents the peer involved in an account transaction. Currently, it can be one of

- [AccountTransactionPeerExternal](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accounttransactionpeerexternal)
- [AccountTransactionPeerMainAccount](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accounttransactionpeermainaccount)
- [AccountTransactionPeerRelatedAccount](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accounttransactionpeerrelatedaccount)
- [AccountTransactionPeerAd](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#accounttransactionpeerad)

#### AccountTransactionPeerExternal

The peer represents an external source of funds.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the peer, always “external”. |
| comment | String | _Optional._ A comment describing the external source. For example, it could be an invoice number. |

#### AccountTransactionPeerMainAccount

The peer represents the main account.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the peer, always “main\_account”. |

#### AccountTransactionPeerRelatedAccount

The peer represents a related account.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the peer, always “related\_account”. |
| account\_id | String | Unique identifier of the related account. |
| account\_title | String | Title of the related account. |

#### AccountTransactionPeerAd

The peer represents an advertisement from the current account.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the peer, always “ad”. |
| ad\_id | Integer | Ad identifier. Unique in the current account. |
| ad\_title | String | Ad title. |
| ad\_is\_deleted | Boolean | _Optional._ If _True_, the advertisement was already deleted. |

#### AccountReportItem

This object represents the stats of an active advertisement.

| Field | Type | Description |
| --- | --- | --- |
| ad\_id | Integer | Ad identifier. Unique in the current account. |
| ad\_title | String | Ad title. |
| ad\_is\_deleted | Boolean | _Optional._ If _True_, the advertisement was already deleted. |
| views | Integer | Views of the advertisement. |
| opens | Integer | Video opens in the advertisement. |
| clicks | Integer | Clicks of the advertisement. |
| actions | Integer | Number of user actions counted as conversions. |
| currency | String | Currency of the account. Can be either “EUR”, “TON” or “XTR”. |
| spent\_budget | Float | Spent amount in the account's currency. |

#### InputFile

This object represents the contents of a file to be uploaded. Must be posted using multipart/form-data in the usual way that files are uploaded via the browser.

#### AdPhoto

This object represents a photo that can be displayed in an advertisement.

| Field | Type | Description |
| --- | --- | --- |
| photo\_id | String | Unique identifier of the photo. This identifier is unique for each individual account and **can't** be transferred from one account to another. |
| photo\_url | String | URL of the photo. |

#### AdVideo

This object represents a video that can be displayed in an advertisement.

| Field | Type | Description |
| --- | --- | --- |
| video\_id | String | Unique identifier of the video. This identifier is unique for each individual account and **can't** be transferred from one account to another. |
| video\_url | String | URL of the video. |

#### WebsitePhoto

This object represents a photo of the website.

| Field | Type | Description |
| --- | --- | --- |
| photo\_id | String | Unique identifier of the photo of the website. This identifier is unique for each individual account and **can't** be transferred from one account to another. |
| photo\_url | String | URL of the photo of the website. |

#### Ad

This object represents an advertisement.

| Field | Type | Description |
| --- | --- | --- |
| ad\_id | Integer | Ad identifier. Unique in the current account. |
| title | String | Ad title. |
| currency | String | Currency of the account. Can be either “EUR”, “TON” or “XTR”. |
| text | String | Text of the advertisement. |
| photo | [AdPhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adphoto) | _Optional._ The photo displayed in the advertisement. |
| video | [AdVideo](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#advideo) | _Optional._ The video displayed in the advertisement. |
| promote\_url | String | The URL of the promoted channel, post, bot or website. |
| cpm | Float | The price per 1000 impressions in the account's currency. |
| placement | String | Placement of the advertisement. Can be either “channel\_post”, “bot\_banner”, “search\_result” or “video\_banner”. |
| target | [AdTarget](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtarget) | _Optional._ Target settings. Returns if _return\_target_ is passed. |
| impression\_frequency | Integer | _Optional._ Frequency of ad impressions to a single user per day. If empty, the ad is shown to the user only once a day. |
| website\_name | String | _Optional._ Name of the website you want to promote. |
| website\_photo | [WebsitePhoto](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#websitephoto) | _Optional._ The photo of the website you want to promote. |
| button | String | _Optional._ Type of the button to be displayed in the advertisement. Can be either “subscribe”, “view”, “read”, “learn\_more”, “download”, “open”, “sign\_up”, “buy”, “order”, “play”, “try” or “leave\_request”. If empty, the default button labeled “Open Website” will be displayed. |
| conversion\_event\_id | String | _Optional._ A pixel event used to track conversions. |
| additional\_info | String | _Optional._ Additional information that can be viewed by users. |
| show\_userpic | Boolean | _Optional._ If _True_ the advertisement contains a picture of the promoted channel or bot. |
| spent\_budget | Float | Spent amount in the account's currency. |
| remaining\_budget | Float | Remaining amount in the account's currency. |
| daily\_spent\_budget | Float | _Optional._ Daily spent amount in the account's currency. Returns if a daily budget limit is set. |
| daily\_budget\_limit | Float | _Optional._ Daily budget limit in the account's currency. |
| views | Integer | Views of the advertisement. |
| opens | Integer | _Optional._ Video opens in the advertisement. |
| clicks | Integer | _Optional._ Clicks of the advertisement. |
| actions | Integer | Number of user actions counted as conversions. The tracked action depends on the ad's _action\_type_. If _action\_type_ is not set, this value will be 0. |
| action\_type | String | _Optional._ The type of action used to track conversions. Can be either “join”, “start\_bot”, “launch\_miniapp”, “send\_message”, “page\_view”, “landing\_view”, “add\_to\_cart”, “add\_to\_wishlist”, “customize\_product”, “initiate\_checkout”, “add\_payment\_info”, “purchase”, “contact”, “lead”, “schedule”, “complete\_registration”, “submit\_application”, “start\_trial”, “subscribe”, “view\_content”, “search”, “find\_location”, “donate”, “custom”. |
| created\_date | Integer | Point in time (Unix timestamp) when the advertisement was created. |
| is\_paused | Boolean | _Optional._ _True_, if the advertisement is paused. |
| activate\_date | Integer | _Optional._ Date in Unix time when the advertisement will be activated. |
| deactivate\_date | Integer | _Optional._ Date in Unix time when the advertisement will be paused. |
| schedule | [AdSchedule](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adschedule) | _Optional._ Schedule for displaying the advertisement by hours. |
| status | String | Status of the advertisement, can be either “stopped”, “ready\_for\_review”, “in\_review”, “declined”, “active” or “on\_hold”. An ad with the “ready\_for\_review” status can be submitted for review via the [submitAdForReview](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#submitadforreview) method. |
| decline\_reason | [DeclineReason](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#declinereason) | _Optional._ Describes the reason for the advertisement rejection if status is “declined”. |

#### InputAdSchedule

This object represents the schedule for displaying the ad. To remove the schedule, _False_ can be used instead of this object.

| Field | Type | Description |
| --- | --- | --- |
| week\_hours\_mask | Array of Integer | A JSON-serialized array of bitwise masks for displaying the ad by hours. Should be an array of exactly 7 numbers. The first number determines the hours to display the ad on Mondays, the second – on Tuesdays, and so on. Each bit of the number determines whether to display the ad in the corresponding hour. The 0th bit corresponds to the period from 00:00 to 01:00, the 1st bit – from 01:00 to 02:00, and so on. So the values of the numbers should be from 0 to 16777215. If all numbers are equal to 0, it is considered that the schedule is not set, and the ad will be displayed at any time. |
| timezone | Integer | _Optional_. Timezone (time offset in seconds from UTC) in which the schedule should be applied. Can be either _-43200_, _-39600_, _-36000_, _-34200_, _-32400_, _-28800_, _-25200_, _-21600_, _-18000_, _-14400_, _-12600_, _-10800_, _-9000_, _-7200_, _-3600_, _0_, _3600_, _7200_, _10800_, _12600_, _14400_, _16200_, _18000_, _19800_, _20700_, _21600_, _23400_, _25200_, _28800_, _31500_, _32400_, _34200_, _36000_, _37800_, _39600_, _43200_, _45900_, _46800_, _49500_, _50400_. Required if the parameter _use\_viewer\_timezone_ is not applicable or not set to _True_. |
| use\_viewer\_timezone | Boolean | _Optional_. Pass _True_ if the schedule should be applied in the timezone of the viewer. Applicable for targeting type _users_ only. |

#### AdSchedule

This object represents the schedule for displaying the ad.

| Field | Type | Description |
| --- | --- | --- |
| week\_hours\_mask | Array of Integer | List of bitwise masks for displaying the ad by hours, the array of exactly 7 numbers. The first number determines the hours to display the ad on Mondays, the second – on Tuesdays, and so on. Each bit of the number determines whether to display the ad in the corresponding hour. The 0th bit corresponds to the period from 00:00 to 01:00, the 1st bit – from 01:00 to 02:00, and so on. |
| timezone | Integer | _Optional_. Timezone (time offset in seconds from UTC) in which the schedule will be applied. |
| use\_viewer\_timezone | Boolean | _Optional_. _True_, if the schedule will be applied in the timezone of the viewer. |

#### DeclineReason

This object represents the reason for the advertisement rejection.

| Field | Type | Description |
| --- | --- | --- |
| text | String | Short reason for rejection. |
| description\_html | String | Detailed description of the reason in HTML format. |

#### InputAdTarget

This object represents target settings for an ad. The Telegram Ads Platform currently supports 4 types of target settings:

- [InputAdTargetChannels](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputadtargetchannels)
- [InputAdTargetUsers](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputadtargetusers)
- [InputAdTargetBots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputadtargetbots)
- [InputAdTargetSearch](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#inputadtargetsearch)

#### InputAdTargetChannels

This object represents target settings for an ad that targets channels. Three different sets of targeting parameters are supported:

- By channel languages (up to 8 languages),
- By topics in one language (up to 20 topics),
- By specific channels (up to 100 channels).

In addition, you can also exclude channels of certain topics, as well as specific channels. However, the number of mentioned topics (both included and excluded) should not exceed 20, and the number of channels (both included and excluded) should not exceed 100.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _channels_ |
| language\_codes | Array of String | _Optional_. A JSON-serialized list of 0-8 [IETF language tags](https://en.wikipedia.org/wiki/IETF_language_tag) representing target channel languages. Use the [getTargetLanguagesList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargetlanguageslist) method to get a list of available language tags. Must be empty if _channel\_ids_ is used, or exactly one if _topic\_ids_ is used. |
| topic\_ids | Array of Integer | _Optional_. A JSON-serialized list of 0-20 target topic identifiers. Use the [getTargetTopicsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargettopicslist) method to get a list of available topics. The maximum number of topics that can be passed in both fields _topic\_ids_ and _exclude\_topic\_ids_ should not exceed 20. Must be empty if _channel\_ids_ is used. |
| exclude\_topic\_ids | Array of Integer | _Optional_. A JSON-serialized list of target topic identifiers to exclude even if the channel matches some of your target topics. Use [getTargetTopicsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargettopicslist) method to get a list of available topics. The maximum number of topics that can be passed in both fields _topic\_ids_ and _exclude\_topic\_ids_ should not exceed 20. |
| channel\_ids | Array of Integer or String | _Optional_. A JSON-serialized list of 0-100 unique identifiers for the target channel or username of the target channel (in the format `@channelusername`). Numeric identifiers can only be used if they were previously resolved by this account via username (see [Resolving channels and bots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#resolving-channels-and-bots)). The maximum number of channels that can be passed in both fields _channel\_ids_ and _exclude\_channel\_ids_ should not exceed 100. When used, _topic\_ids_ and _language\_codes_ must both be empty. |
| exclude\_channel\_ids | Array of Integer or String | _Optional_. A JSON-serialized list of 0-100 unique identifiers for the channel or username of the channel (in the format `@channelusername`) to exclude even if they match your topic selection. The maximum number of channels that can be passed in both fields _channel\_ids_ and _exclude\_channel\_ids_ should not exceed 100. Numeric identifiers can only be used if they were previously resolved by this account via username (see [Resolving channels and bots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#resolving-channels-and-bots)). |

#### InputAdTargetUsers

This object represents target settings for an ad that targets specific user demographics. The following targeting parameters are supported:

- By countries (up to 8 countries),
- By user locations (up to 20 locations),
- By user languages (up to 8 languages),
- By user interests (up to 20 topics),
- By channel audiences (up to 100 channels),
- By specific users using retargeting audiences (up to 1000000 phone numbers in each),
- By device type.

Additionally, you can always exclude certain topics, audiences of certain channels as well as specific users using retargeting audiences. However, the number of mentioned topics (both included and excluded) should not exceed 20, the number of mentioned channels (both included and excluded) should not exceed 100, and the number of retargeting audiences (both included and excluded) should not exceed 10.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _users_ |
| country\_codes | Array of String | A JSON-serialized list of 0-8 two-letter ISO 3166-1 alpha-2 country codes. Use [getTargetCountriesList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargetcountrieslist) method to get a list of available countries. Must be exactly one if _location\_ids_ is passed. |
| location\_ids | Array of Integer | _Optional_. A JSON-serialized list of 0-20 locations. Use [getTargetLocationsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargetlocationslist) method to get a list of available locations. All locations from the list must belong to the same country specified in the _country\_codes_. |
| language\_codes | Array of String | _Optional_. A JSON-serialized list of 0-8 [IETF language tags](https://en.wikipedia.org/wiki/IETF_language_tag) of the user's language. Use the [getTargetLanguagesList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargetlanguageslist) method to get a list of available language tags. |
| topic\_ids | Array of Integer | _Optional_. A JSON-serialized list of target topic identifiers. Use the [getTargetTopicsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargettopicslist) method to get a list of available topics. The maximum number of topics that can be passed in both fields _topic\_ids_ and _exclude\_topic\_ids_ should not exceed 20. |
| intersect\_topics | Boolean | _Optional_. Pass _True_ to target users who have all the listed topics in their interests. When set to _True_, it ensures that the targeting is specific to users who exhibit a combination of all the specified interests, rather than any one of them. |
| exclude\_topic\_ids | Array of Integer | _Optional_. A JSON-serialized list of target topic identifiers to exclude even if the user matches some of your target topics. Use the [getTargetTopicsList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#gettargettopicslist) method to get a list of available topics. The maximum number of topics that can be passed in both fields _topic\_ids_ and _exclude\_topic\_ids_ should not exceed 20. |
| channel\_ids | Array of Integer or String | _Optional_. A JSON-serialized list of 0-100 unique identifiers for the target channel or username of the target channel (in the format `@channelusername`). Numeric identifiers can only be used if they were previously resolved by this account via username (see [Resolving channels and bots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#resolving-channels-and-bots)). The maximum number of channels that can be passed in both fields _channel\_ids_ and _exclude\_channel\_ids_ should not exceed 100. |
| exclude\_channel\_ids | Array of Integer or String | _Optional_. A JSON-serialized list of 0-100 unique identifiers for the channel or username of the channel (in the format `@channelusername`) to exclude their audience even if they match your target settings. The maximum number of channels that can be passed in both fields _channel\_ids_ and _exclude\_channel\_ids_ should not exceed 100. Numeric identifiers can only be used if they were previously resolved by this account via username (see [Resolving channels and bots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#resolving-channels-and-bots)). |
| audience\_ids | Array of Integer | _Optional_. A JSON-serialized list of 0-4 unique audience identifiers. Use the [getAudiencesList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#getaudienceslist) method to get a list of audiences. The maximum number of audiences that can be passed in both fields _audience\_ids_ and _exclude\_audience\_ids_ should not exceed 10. |
| exclude\_audience\_ids | Array of Integer | _Optional_. A JSON-serialized list of 0-4 unique identifiers of the audiences to exclude even if they match your target audiences. Use the [getAudiencesList](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#getaudienceslist) method to get a list of audiences. The maximum number of audiences that can be passed in both fields _audience\_ids_ and _exclude\_audience\_ids_ should not exceed 10. |
| device | String | _Optional_. The type of device, currently one of “ios”, “android”, “mobile”, “desktop”. Set this parameter to target users based on the device they use. |
| exclude\_political\_channels | Boolean | _Optional_. Pass _True_ to prevent the ad from showing in political channels. |
| political\_channels\_only | Boolean | _Optional_. Pass _True_ to show the ad in political channels only. |

#### InputAdTargetBots

This object represents target settings for an ad that targets bots. Currently, the only supported targeting parameter is:

- By specific bots (up to 100 bots).

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _bots_ |
| bot\_ids | Array of Integer or String | _Optional_. A JSON-serialized list of 0-100 unique identifiers for the target bot or username of the target bot (in the format `@usernamebot`). Numeric identifiers can only be used if they were previously resolved by this account via username (see [Resolving channels and bots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#resolving-channels-and-bots)). |

#### InputAdTargetSearch

This object represents target settings for an ad that targets search queries. Currently, the only supported targeting parameter is:

- By search queries (up to 10 keywords or phrases).

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _search_ |
| search\_queries | Array of String | A JSON-serialized list of up to 10 keywords or phrases to target. |

#### AdTarget

This object represents target settings for an ad. The Telegram Ads Platform currently supports 4 types of target settings:

- [AdTargetChannels](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtargetchannels)
- [AdTargetUsers](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtargetusers)
- [AdTargetBots](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtargetbots)
- [AdTargetSearch](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtargetsearch)

#### AdTargetChannels

This object represents target settings for an ad that targets channels.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _channels_ |
| languages | Array of [TargetLanguage](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetlanguage) | _Optional_. List of target channel languages. |
| topics | Array of [TargetTopic](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targettopic) | _Optional_. List of target topics. |
| exclude\_topics | Array of [TargetTopic](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targettopic) | _Optional_. List of target topics to exclude even if the channel matches some of your target topics. |
| channels | Array of [TargetChannel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetchannel) | _Optional_. List of target channels. |
| exclude\_channels | Array of [TargetChannel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetchannel) | _Optional_. List of target channels to exclude even if they match your topic selection. |

#### AdTargetUsers

This object represents target settings for an ad that targets specific user demographics.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _users_ |
| countries | Array of [TargetCountry](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetcountry) | List of target countries. |
| locations | Array of [TargetLocation](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetlocation) | _Optional_. List of target locations. |
| languages | Array of [TargetLanguage](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetlanguage) | _Optional_. List of target user's languages. |
| topics | Array of [TargetTopic](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targettopic) | _Optional_. List of target topics. |
| intersect\_topics | Boolean | _Optional_. If _True_, the targeting is specific to users who exhibit a combination of all the specified interests, rather than any one of them. |
| exclude\_topics | Array of [TargetTopic](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targettopic) | _Optional_. List of target topics to exclude even if the user matches some of your target topics. |
| channels | Array of [TargetChannel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetchannel) | _Optional_. List of target channels. |
| exclude\_channels | Array of [TargetChannel](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetchannel) | _Optional_. List of target channels to exclude even if they match your target settings. |
| audiences | Array of [Audience](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#audience) | _Optional_. List of target audiences. |
| exclude\_audiences | Array of [Audience](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#audience) | _Optional_. List of target audiences to exclude even if they match your target audiences. |
| device | String | _Optional_. The type of target device, currently one of “ios”, “android”, “mobile”, “desktop”. |
| exclude\_political\_channels | Boolean | _Optional_. If _True_, the advertisement is not shown in political channels. |
| political\_channels\_only | Boolean | _Optional_. If _True_, the advertisement is shown in political channels only. |

#### AdTargetBots

This object represents target settings for an ad that targets bots.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _bots_ |
| bots | Array of [TargetBot](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetbot) | List of target bots. |

#### AdTargetSearch

This object represents target settings for an ad that targets search queries.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the target settings, must be _search_ |
| search\_queries | Array of String | List of target keywords or phrases. |

#### AdList

This object represents an advertisement list.

| Field | Type | Description |
| --- | --- | --- |
| total\_count | Integer | Total number of advertisements in the current account. |
| ads | Array of [Ad](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#ad) | List of requested advertisements. |
| next\_offset | String | _Optional._ If present, represents the offset to receive the next portion of the advertisements. |

#### AdTransactionsList

This object represents a list of transactions related to an ad.

| Field | Type | Description |
| --- | --- | --- |
| total\_count | Integer | Total number of transactions. |
| transactions | Array of [AdTransaction](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtransaction) | List of requested transactions. |
| next\_offset | String | _Optional._ If present, represents the offset to receive the next portion of the transactions. |

#### AdTransaction

This object represents an ad transaction.

| Field | Type | Description |
| --- | --- | --- |
| peer | [AdTransactionPeer](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtransactionpeer) | The peer involved in the transaction. |
| date | Integer | Point in time (Unix timestamp) when the transaction occurred. |
| currency | String | Currency of the account. Can be either “EUR”, “TON” or “XTR”. |
| amount | Float | Transaction amount in the account's currency. A negative amount represents a withdrawal from the ad budget. |

#### AdTransactionPeer

This object represents the peer involved in an ad transaction. Currently, it can be one of

- [AdTransactionPeerAccount](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtransactionpeeraccount)
- [AdTransactionPeerViews](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#adtransactionpeerviews)

#### AdTransactionPeerAccount

The peer represents the account related to the advertisement.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the peer, always “account”. |

#### AdTransactionPeerViews

The peer represents the paid views of the advertisement.

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of the peer, always “views”. |
| views | Integer | Views of the advertisement. |

#### AdStatItem

This object represents stats for an advertisement over a certain period.

| Field | Type | Description |
| --- | --- | --- |
| from\_time | Integer | Start of the period, in Unix time. The start point is included in the result. |
| to\_time | Integer | End of the period, in Unix time. The end point is not included in the result. |
| views | Integer | Views for the selected period. |
| opens | Integer | Video opens for the selected period. |
| clicks | Integer | Clicks for the selected period. |
| actions | Integer | Number of user actions counted as conversions for the selected period. |
| currency | String | Currency of the account. Can be either “EUR”, “TON” or “XTR”. |
| spent\_budget | Float | Spent amount in the account's currency in the selected period. |

#### Audience

This object represents an audience.

| Field | Type | Description |
| --- | --- | --- |
| audience\_id | Integer | Unique identifier of the audience. |
| title | String | Audience title. |
| size | Integer | Audience size. This is the **approximate** number of phone numbers included in the audience. 0 means an empty audience, 50 means audience with less than 100 phone numbers. |
| ads\_count | Integer | Number of advertisements that target this audience. |
| created\_date | Integer | Point in time (Unix timestamp) when the audience was created. |
| updated\_date | Integer | Point in time (Unix timestamp) when the audience was updated. |

#### AudiencesList

This object represents an audience list.

| Field | Type | Description |
| --- | --- | --- |
| total\_count | Integer | Total number of audiences in the current account. |
| audiences | Array of [Audience](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#audience) | List of requested audiences. |

#### Pixel

This object represents a Pixel Tag.

| Field | Type | Description |
| --- | --- | --- |
| pixel\_id | String | Unique identifier of the pixel. |
| code\_snippet | String | The base code snippet that must be placed before the `</head>` HTML tag of all pages on your website. |

#### PixelEvent

This object represents a pixel event.

| Field | Type | Description |
| --- | --- | --- |
| event\_id | String | Unique identifier of the pixel event. |
| title | String | Event title. |
| type | String | Type of the event. Can be either “page\_view”, “landing\_view”, “add\_to\_cart”, “add\_to\_wishlist”, “customize\_product”, “initiate\_checkout”, “add\_payment\_info”, “purchase”, “contact”, “lead”, “schedule”, “complete\_registration”, “submit\_application”, “start\_trial”, “subscribe”, “view\_content”, “search”, “find\_location”, “donate”, “custom”. |
| status | String | Status of the pixel event, can be either “inactive” or “active”. |
| ads\_count | Integer | Number of advertisements that have used this pixel event as a conversion event. |
| created\_date | Integer | Point in time (Unix timestamp) when the pixel event was created. |
| last\_triggered\_date | Integer | _Optional._ Point in time (Unix timestamp) when the pixel event was last triggered. Omitted if the event has never been triggered or was last triggered more than 7 days ago. |
| auto\_created | Boolean | _Optional._ _True_ if the pixel event was automatically created. You can't edit or delete such an event. |
| code\_snippet | String | _Optional._ The event code snippet that must be placed in the elements of your website where you want to track customer actions. Omitted if this pixel event does not require additional code and the base code alone is sufficient. |

#### PixelEventsList

This object represents a list of pixel events.

| Field | Type | Description |
| --- | --- | --- |
| total\_count | Integer | Total number of pixel events in the current account. |
| events | Array of [PixelEvent](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#pixelevent) | List of requested pixel events. |

#### TargetLanguage

This object represents an available target language.

| Field | Type | Description |
| --- | --- | --- |
| language\_code | String | [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) of the language. |
| name | String | Name of the language. |

#### TargetTopic

This object represents an available target topic.

| Field | Type | Description |
| --- | --- | --- |
| topic\_id | Integer | Topic identifier. |
| name | String | Name of the topic. |

#### TargetCountry

This object represents an available target country.

| Field | Type | Description |
| --- | --- | --- |
| country\_code | String | Two-letter ISO 3166-1 alpha-2 country code. |
| name | String | Name of the country. |

#### TargetLocation

This object represents an available target location (i.e., city, populated area, district, etc).

| Field | Type | Description |
| --- | --- | --- |
| location\_id | Integer | Location identifier. |
| name | String | Name of the location. |
| country\_code | String | _Optional._ Two-letter ISO 3166-1 alpha-2 country code of location. |
| region | String | _Optional._ Region of the location. |

#### TargetLocationList

This object represents a location list.

| Field | Type | Description |
| --- | --- | --- |
| total\_count | Integer | Total number of locations. |
| locations | Array of [TargetLocation](https://parse.firecrawl.dev/uploads/Telegram%20Ads.html#targetlocation) | List of locations. |
| next\_offset | String | _Optional._ If string is not empty, the offset to receive next portion of the locations. |

#### TargetChannel

This object represents a target channel.

| Field | Type | Description |
| --- | --- | --- |
| channel\_id | Integer | Unique identifier for this channel. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier. |
| title | String | _Optional_. Title of the channel. |
| username | String | _Optional_. Username of the channel, if available. |
| photo\_url | String | _Optional_. URL of the channel’s photo. The photo can be in JPEG or SVG formats. |

#### TargetBot

This object represents a target bot.

| Field | Type | Description |
| --- | --- | --- |
| bot\_id | Integer | Unique identifier for this bot. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier. |
| title | String | _Optional_. Title of the bot. |
| username | String | _Optional_. Username of the bot, if available. |
| photo\_url | String | _Optional_. URL of the bot’s photo. The photo can be in JPEG or SVG formats. |