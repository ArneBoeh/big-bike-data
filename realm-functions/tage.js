exports = function(query) {

    var von = new Date(query.von);
    var bis = new Date(query.bis);
    var zaehlstelle = query.zaehlstelle;
  
    return context.services.get("mongodb-atlas").db("MunichBikes").collection("tage").aggregate([
      {
        $match: { 
          zeit: { $gte: von, $lte: bis },
          zaehlstelle: { $eq: zaehlstelle }
        }
      },
      {
        $project: {
          _id: 0,
          frequenz: '$gesamt',
          tag: '$zeit'
        }
      },
      {
        $sort: {  
          zeit: 1,
        }
      }
    ]).toArray();
  
  };