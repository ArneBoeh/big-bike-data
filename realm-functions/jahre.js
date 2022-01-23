
   
exports = function() {

    return context.services.get("mongodb-atlas").db("MunichBikes").collection("tage").aggregate([
      {
        $group: {
          _id: { jahr: { $year: "$zeit" }, zaehlstelle: "$zaehlstelle" },
          gesamt: { $sum: "$gesamt" }
        }
      },
      {
        $group: {
          _id: "$_id.jahr",
          gesamt: { $sum: "$gesamt" },
          zaehlstellen: { $push: {
            zaehlstelle: "$_id.zaehlstelle",
            gesamt: "$gesamt"
          }}
        }
      },
      {
        $project: {  
          _id: 0,
          jahr: "$_id",
          gesamt: 1,
          zaehlstellen: 1
        }
      },
      {
        $sort: {  
          jahr: 1,
        }
      }
    ]).toArray();
  
  };