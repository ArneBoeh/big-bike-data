  
exports = async function(request, response) {
  
    // remove / at the beginning
    let name = context.request.webhookUrl.substring(1);
    
    // call the actual function
    let result = await context.functions.execute(name, request.query);
  
    // Convert result to plain json (not MongoDB's EJSON) 
    response.setHeader("Content-Type",  "application/json");
    response.setBody(JSON.stringify(result));
  
  };