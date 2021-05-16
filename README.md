# discogs-list-importer

Programmatically upload JSON dumps to discogs lists

### Upload a list using this utility
1. Run `npm i` after cloning
2. Create an `.env` file with variables for `user=foo` and `password=bar`
3. Run `node discogs-list-importer.js --file path/to/file.json --list "some existing list"`
4. The `--file` should be JSON in the same format as a downloaded list from the API as shown below

### Download a list using the [Discogs API](https://www.discogs.com/developers#page:user-lists)

```
curl https://api.discogs.com/users/_morning/lists | jq . # get all lists for /users/{username}/lists
curl https://api.discogs.com/lists/190092 | jq . # get list by id
```

### TODO
- Create list programmatically if it doesn't exist instead of printing an error

