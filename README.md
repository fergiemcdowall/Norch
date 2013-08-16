#Norch

Norch is an experimental search engine built with [Node.js](http://nodejs.org/) and
[Search-index](https://github.com/fergiemcdowall/search-index). The name Norch is a contraction of " **No** de Sea **rch** "

**Homepage:** http://www.norch.net

**Github:** https://github.com/fergiemcdowall/norch

#Features

* Full text search
* Stopword removal
* Faceting
* Filtering
* Fielded search
* Field weighting
* Relevance weighting (tf-idf)
* Paging (offset and resultset length)

##Download

**git:**

    git clone https://github.com/fergiemcdowall/norch

**http:**

http://fergiemcdowall.github.io/norch

##Installing Norch

Norch has 2 dependencies- Node.js and npm (Node Package Manager). Given that these are both installed Norch can be installed by running the following command which will download and install all dependencies:

    npm install

If everything went to plan- Norch should now be installed on your machine

## Developing/Installing on Norch inside of the Vagrant box

1. Install [VirtualBox](https://www.virtualbox.org/)
2. Install [Vagrant](http://www.vagrantup.com/)
3. `vagrant up`
4. `vagrant ssh`
5. `npm install`

__Note:__ when starting Norch insde a Vagrant VM you must spesify the norch home directory, see Commandline options.

#Operation

*Note: for the purposes of accessability, this doc assumes that Norch is being installed locally on your own computer
(localhost). Once Norch is rolled out on to remote servers, the hostname on all URLs should be updated accordingly.*

##Start your Norch server

Navigate to the directory where you installed Norch and type

    node norch

### Commandline options

```
  $ node norch --help

  Usage: norch [options]

  Options:

      -h, --help         output usage information
      -V, --version      output the version number
      -p, --port <port>  specify the port, defaults to 3000
      -h, --home <home>  specify the home directory, stores the index and settings, defaults to ./norch
```

When running norch inside of a vagrant VM (virtualbox) the home directory cannot be in a shared folder. I recommend having home point to `/home/vagrant/norch

Hurrah! Norch is now running locally on your machine. Head over to [http://localhost:3000/](http://localhost:3000/)
and marvel. The default port of 3000 can be modified if required.

##Indexing
Once you have set up Norch, you can get some content into it. Norch comes with a JSONified version of the venerable
Reuters-21578 test dataset in the directory "testdata". To index this data cd into the directory "testdata" and run
the following command (note that one data file can contain an arbitralily large number of documents)

    curl --form document=@reuters-000.json http://localhost:3000/indexer --form filterOn=places,topics,organisations

If you are on a unix machine (including mac OSX), you can also run /index.sh in order to read in the entire dataset
of 21 batch files.

Generally Norch indexes data that is in the format

```javascript
{
  'doc1':{
    'title':'A really interesting document',
    'body':'This is a really interesting document',
    'metadata':['red', 'potato']
  },
  'doc2':{
    'title':'Another interesting document',
    'body':'This is another really interesting document that is a bit different',
    'metadata':['yellow', 'potato']
  }
}
```

That is to say an object containing a list of key:values where the key is the document ID and the values are a futher
list of key:values that define the fields. Fields can be called anything other than 'ID'. Field values can be either
strings or simple arrays.

##Indexing parameters

###filterOn

Example

```
 --form filterOn=places,topics,organisations
```

filterOn is an array of fields that can be used to filter search results. Each defined field must be an array field in
the document. filterOn will not work with string fields.


#Searching

Search is available on [http://localhost.com:3000/search](http://localhost.com:3000/search)

##Search parameters

###q
**(Required)** For "query". The search term. Asterisk (```*```) returns everything.

Usage:

    q=<query term>

[http://localhost:3000/search?q=moscow](http://localhost:3000/search?q=moscow)

###searchFields

Search on specified fields. Ignore text that exists in other fields.

    searchFields[]=<field to search in>
    
[http://localhost:3000/search?q=plans&searchFields[]=body](http://localhost:3000/search?q=plans&searchFields[]=body)

###facets
**(Optional)** For "facet". The fields that will be used to create faceted navigation

Usage:

    facets=<field to facet on>

[http://localhost:3000/search?q=moscow&facets=topics](http://localhost:3000/search?q=moscow&facets=topics)

###filter
**(Optional)** For "filter". Use this option to limit your search to the given field

Usage:

    filter[<filter field>][]=<value>

[http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&filter[topics][]=acq](http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain)

Multiple filters:

[http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&filter[topics][]=acq&filter[places][]=ussr](http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&filter[topics][]=acq&filter[places][]=ussr)


###offset

**(Optional)** The index in the resultSet that the server
  returns. Userful for paging.

Usage:

    offset=<start index>

[http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&offset=5](http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&offset=5)

###pagesize

**(Optional)** defines the size of the resultset (defaults to 20)

Usage:

    pagesize=<size of resultset>

[http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&offset=5&pagesize=5](http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&offset=5&pagesize=5)

###weight
**(Optional)** For "weight". Use this option to tune relevancy by assigning weight to given fields. Weights can be arbitralily large.

Usage:

    weight[<field name>][]:<weight (factor)>

[http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&weight[title][]=10](http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&weight[title][]=10)

Multiple field weights:

[http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&weight[title][]=10&weight[body][]=2](http://localhost:3000/search?q=moscow&facets=topics&filter[topics][]=grain&weight[title][]=10&weight[body][]=2)

#Known Issues

Norch is new software and as such should be regarded as a work in progress. Administrators should be aware of the
following:

 * **The GUI (scrolling)** the default GUI is very much a temporary measure. The instant search function is flaky and currently
 there is no support for scrolling

Indexing and GUI is the current focus of development

#License

Norch is released under the MIT license:

Copyright (c) 2013 Fergus McDowall

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


