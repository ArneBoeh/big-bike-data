exports = function(query) {

    var zaehlstelle = query.zaehlstelle;
  
    return context.services.get("mongodb-atlas").db("MunichBikes").collection("viertelstunden").aggregate([
      {
        $match: { 
          zaehlstelle: { $eq: zaehlstelle }
        }
      },
      {
        $group: {
          _id: { stunde: { $hour: "$zeit" }, tag: { $dayOfWeek: "$zeit" } },
          richtung_1: { $sum: "$richtung_1" },
          richtung_2: { $sum: "$richtung_2" }
        }
      },
      {
        $project: {  
          _id: 0,
          richtungen: [
            { stunde: "$_id.stunde", tag: "$_id.tag", frequenz: "$richtung_1", richtung: 1 },
            { stunde: "$_id.stunde", tag: "$_id.tag", frequenz: "$richtung_2", richtung: 2 }
          ]
        }
      },
      {
          $unwind : "$richtungen"
      },
      {
          $replaceRoot: { newRoot: "$richtungen" }
      },
      {
        $sort: {
          tag: 1,
          stunde: 1,
          richtung: 1
        }
      }
    ]).toArray();
  
  };