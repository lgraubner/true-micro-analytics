# true-micro-analytics

Simple analytics server using [`micro`](https://github.com/zeit/micro). Track views and more by performing a plain `get` request. Heavily inspired by [`micro-analytics`](https://github.com/mxstbr/micro-analytics) from Max Stoiber.  

## Get started

Simply install `true-micro-analytics` globally and start it using `true-micro-analytics` command.

```
npm install -g true-micro-analytics
true-micro-analytics
```

Your server is now listening for requests. To keep the server running without having the shell open all the time you can use [pm2](http://pm2.keymetrics.io/) or [forever](https://github.com/foreverjs/forever)

All cli arguments are passed through to [`micro`](https://github.com/zeit/micro). That said you can set a different host or port.

### Make it available

In production you should set up a Nginx Reverse Proxy (or something similar) to make the Node server public. Digital Ocean has a splendid tutorial on [how to set up a server](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04) with Node.js, Nginx, and pm2.

## How to Track Data

To track a page view, command execution or anything else just make a get request to the corresponding path.

```JavaScript
fetch(http://example.com/mypage)
  .catch((err) => {
    console.error('Could not track view.', err);
    });
```

The request will return a `204` HTTP status code without any content.

### Get page count

To get the page view count of any endpoint call the same URL as above followed by `?count`.

```
http://example.com/mypage?count
```

This will return a JSON object containing the accumulated views.

```JavaScript
{"views": 236}
```

### Get page views

To get the page view data for a specific path call the same URL again with `?views` at the end.

```
http://example.com/page?views
```

The response is a JSON object containing an object for every view. For now the timestamp of the view is included. This can be expanded with more stats in the future.

```JavaScript
{"views":[{"ts":1484323190294}]}
```

### Get views for all paths

Calling the root URL will return data for all tracked paths.

```
http://example.com/
```

## Motivation & goals

Max Stoiber came up with the awesome idea of some minimal analytics Node server. As I dived into the code I came across some things I would have done different. Therefore I wanted to make something very similar that suits my needs. The following were the goals I wanted to achieve.

### True micro

I wanted to make a really small and consistent module. That means get along with a single file but keep it easily readable. The result are less than 100 LoC (with comments!) in a single file.

**Note:** *Neither the original module nor my implementation are real microservices. Per definition microservices have to be stateless. The analytics servers are persisting data in a databases and are therefore stateful.*

### Consistent URL structure

I wanted to have a consisten and easy to remember URL structure. Firstly the server only accepts `get` requests. There is no need to allow more methods. Otherwise you might have to enable CORS features to enable cross-origin requests.
To utilize the root path it returns all data. For path specific data there are query args (see above).

### Return value of tracking URLs

The tracking URLs are returning HTTP status code `204`. This tells us the server processed the request and doesn't return any data. To get the views we call the URL next off `?count`. This makes it very clear which url is tracking the view by calling it and which is not.
