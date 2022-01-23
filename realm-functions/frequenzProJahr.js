
   
exports = function() {

    return context.services.get("mongodb-atlas").db("frequencies").collection("tage").aggregate([
      {
        $group: {
          _id: { jahr: { $year: "$zeit" }, zaehlstelle: "$zaehlstelle" },
          gesamt: { $sum: "$gesamt" }
        }
      },
      {
        $project: {  
          _id: 0,
          jahr: "$_id.jahr",
          zaehlstelle: "$_id.zaehlstelle",
          gesamt: 1,
        }
      },
      {
        $sort: {  
          jahr: 1,
          zaehlstelle: 1
        }
      }
    ]).toArray();
  
  };
  