
   
exports = function() {

  return context.services.get("mongodb-atlas").db("MunichBikes").collection("tage").aggregate([
    {
      $group: {
        _id: { $year: "$zeit" }
      }
    },
    {
      $project: {  
        _id: 0,
        jahr: "$_id",
      }
    },
    {
      $sort: {  
        jahr: 1,
      }
    }
  ]).toArray();

};