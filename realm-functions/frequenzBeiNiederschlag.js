exports = function() {

    return context.services.get("mongodb-atlas").db("MunichBikes").collection("tage").aggregate([
      {
        $group: {
          _id: { tag: "$zeit"  },
          frequenz: { $sum: "$gesamt" },
          niederschlag: { $max: "$niederschlag" }
        }
      },
      {
        $group: {
          _id: { niederschlag: { $cond : ["$niederschlag", "Niederschlag", "Kein Niederschlag" ] }  },
          frequenz: { $sum: "$frequenz" }
        }
      },
      {
        $project: {  
          _id: 0,
          niederschlag: "$_id.niederschlag",
          frequenz: 1,
        }
      }
    ]).toArray();
  
  };
  