# discogs-list-importer

Programmatically upload JSON dumps to discogs lists

### Upload a list using this utility
- Create an `.env` file with vars for `user=foo` and `password=bar`
- `node discogs-list-importer.js --file path/to/file.json --list "some list"`
- The file should be JSON in the same format as a downloaded list from the API as shown below

### Download a list using the API

[Format: `/users/{username}/lists`](https://www.discogs.com/developers#page:user-lists,header:user-lists-list)

```
curl https://api.discogs.com/users/_morning/lists | jq .
curl https://api.discogs.com/lists/190092 | jq .
```

### TODO
- Create list programmatically if it doesn't exist instead of printing an error

