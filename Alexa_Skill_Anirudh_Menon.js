var https = require('https')

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request .. Invocation Name: youtube data
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("This is Alexa skill for Liquid Studio test", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request .. Total views, Total subscribers, Most viewed video
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {
          case "GetSubscriberCount":
            /*
            Voice commands:
             current subcriptions
             number of subcriptions
             number of subcribers
             total subscribers
            */
            //This youtube API endpoint gives channel information (my personal youtube channel in this case)
            var endpoint = "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=UCi_xD8D_Qn3LZoRU80NGM1A&key={PERSONAL_API_KEY}"
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
                var title = data.items[0].snippet.title             //Channel Name
                var subscriberCount = data.items[0].statistics.subscriberCount      //Get View count
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`Current subscriber count for ${title}'s channel is ${subscriberCount}`, true),    //This is what Alexa reads you back
                    {}
                  )
                )
              })
            })
            break;

          case "GetViewCount":
          /*
          Voice commands:
           current views
           total hits
           total views
           total clicks
          */
            var endpoint = "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=UCi_xD8D_Qn3LZoRU80NGM1A&key={PERSONAL_API_KEY}"
            var body = ""
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk })
              response.on('end', () => {
                var data = JSON.parse(body)
                var title = data.items[0].snippet.title               //Channel name
                var viewCount = data.items[0].statistics.viewCount    //Get count of total views on channel
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`Current view count for ${title}'s channel' is ${viewCount}`, true),           //Alexa's outputSpeech
                    {}
                  )
                )
              })
            })
            break;

            case "GetMostViewed":
            /*
            Voice commands:
             most viewd vide
             maximum viewed video
             most popular video
            */
            //This endpoint gives information about all the videos in youtube channel (my personal youtube channel in this case)
              var endpoint = "https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&maxResults=25&order=viewCount&type=video&key={PERSONAL_API_KEY}"
              var body = ""
              https.get(endpoint, (response) => {
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                  var data = JSON.parse(body)
                  var title = data.items[0].snippet.title     //Since it is ordered based on viewCount, first object in the items list will be the video with maximum views
                  context.succeed(
                    generateResponse(
                      buildSpeechletResponse(`Video with most views is ${title}`, true),
                      {}
                    )
                  )
                })
              })
              break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers

//Builds output text for Alexa to read back in Plain text format with EndSession flag true in all cases
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

//Creates a response object to be sent to amazon services which is then deciphered TTS and read back to user from above helper function
generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}
