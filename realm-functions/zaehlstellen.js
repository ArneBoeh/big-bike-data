
exports = function() {

    return context.services.get("mongodb-atlas").db("frequencies").collection("tage").aggregate([
      {
        $group: {
          _id: "$zaehlstelle",
          gesamt: {
            $sum: "$gesamt",
          },
          von: {
            $min: "$zeit",
          },
          bis: {
            $max: "$zeit",
          },
        }
      },
      {
        $project: {  
          _id: 0,
          zaehlstelle: "$_id",
          gesamt: 1,
          von: 1,
          bis: 1
        }
      },
      {
        $sort: {  
          zaehlstelle: 1,
        }
      }
    ]).toArray();
  
  };