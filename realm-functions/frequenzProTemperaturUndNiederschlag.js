exports = function() {

    return context.services.get("mongodb-atlas").db("MunichBikes").collection("tage").aggregate([
      {
        $group: {
          _id: { tag: "$zeit"  },
          frequenz: { $sum: "$gesamt" },
          niederschlag: { $max: "$niederschlag" },
          temperatur: { $max: "$max-temp" }
        }
      },
      {
        $group: {
          _id: { niederschlag: { $round : "$niederschlag" }, temperatur: { $round : "$temperatur" },  },
          frequenz: { $sum: "$frequenz" }
        }
      },
      {
        $project: {  
          _id: 0,
          niederschlag: "$_id.niederschlag",
          temperatur: "$_id.temperatur",
          frequenz: 1,
        }
      }
    ]).toArray();
  
  };