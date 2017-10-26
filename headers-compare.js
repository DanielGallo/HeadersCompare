'use strict';

/**
 * Author:  Daniel Gallo
 * Date:    October 2017
 * Purpose: Compare the HTTP headers of requests going via Cloudflare 
 *          versus direct to the origin server
 */

var request = require('request'),
    colors = require('colors'),
    diff = require('deep-diff');
    
class Request {
    constructor(urlA, urlB) {
        var me = this,
            cloudflareHeaders = [],
            directHeaders = [];

        console.log('Executing requests...'.grey);

        // Do a request via Cloudflare
        request.get({ 
            url: urlA
        }, function(error, response) {
            cloudflareHeaders = response.headers;

            // Do a direct request to the server
            request.get({ 
                url: urlB,
                strictSSL: false    // Need this to deal with self-signed certificate
            }, function(error, response) {
                directHeaders = response.headers;

                console.log('Requests completed. Starting headers comparison...'.grey);

                me.compare(cloudflareHeaders, directHeaders);
            });
        });
    }

    compare(cloudflareHeaders, directHeaders) {
        var differences = diff(directHeaders, cloudflareHeaders),
            ignore = ['date'],
            difference, msg, header;

        if (differences.length > 0) {
            console.log('Total number of response header changes detected:'.red, differences.length);
            
            for (var item in differences) {
                difference = differences[item];
                header = difference.path[0].bgWhite.black;

                // Check if we should ignore this particular header (e.g. Date)
                if (ignore.indexOf(difference.path[0]) < 0) {
                    console.log('');

                    if (difference.kind == 'D') {
                        msg = 'Header Removed'.bgBlue + ': \t' + header;
                        console.log(msg);

                        msg = '\tValue: \t\t' + difference.lhs;
                        console.log(msg);
                    } else if (difference.kind == 'E') {
                        msg = 'Header Difference'.bgBlue + ': \t' + header;
                        console.log(msg);

                        msg = '\tBefore: \t' + difference.lhs;
                        console.log(msg);

                        msg = '\tAfter: \t\t' + difference.rhs;
                        console.log(msg);
                    } else {
                        msg = 'Header Addition'.bgBlue + ': \t' + header;
                        console.log(msg);

                        msg = '\tValue: \t\t' + difference.rhs;
                        console.log(msg);
                    }
                }
            }
        } else {
            console.log('No differences detected!'.green);
        }
    }
}

// Do the comparison
new Request('https://dangallophotography.com', 'https://34.227.160.175');