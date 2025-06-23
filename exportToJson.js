const fs = require("fs");
const db = require("./firebase");

const COLLECTION_NAME = "UserProfile";
const OUTPUT_FILE = `${COLLECTION_NAME.toLowerCase()}.json`;
const BATCH_SIZE = 500;
const MAX_RECORDS = 100000;

async function exportFirestoreToJsonFile() {
  console.log(`🚀 Starting export of '${COLLECTION_NAME}' to ${OUTPUT_FILE}`);
  console.log(`📊 Will export up to ${MAX_RECORDS} records.`);

  const writeStream = fs.createWriteStream(OUTPUT_FILE);
  writeStream.write("[\n");

  let lastDoc = null;
  let isFirst = true;
  let totalCount = 0;
  let batchNumber = 1;

  try {
    while (totalCount < MAX_RECORDS) {
      console.log(`📦 Fetching batch #${batchNumber}...`);

      let query = db.collection(COLLECTION_NAME).orderBy("__name__").limit(BATCH_SIZE);
      if (lastDoc) query = query.startAfter(lastDoc);

      const snapshot = await query.get();
      if (snapshot.empty) {
        console.log("✅ No more documents to fetch.");
        break;
      }

      console.log(`🔢 Batch #${batchNumber} fetched with ${snapshot.size} documents.`);

      for (const doc of snapshot.docs) {
        if (totalCount >= MAX_RECORDS) break;

        const record = {
          id: doc.id,
          ...doc.data(),
        };

        if (!isFirst) {
          writeStream.write(",\n");
        }

        writeStream.write(JSON.stringify(record, null, 2));
        isFirst = false;
        totalCount++;
      }

      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      console.log(`📤 Finished writing batch #${batchNumber} to stream. Total written: ${totalCount}`);
      batchNumber++;
    }

    writeStream.write("\n]");
    writeStream.end();

    writeStream.on("finish", () => {
      console.log(`🎉 Export complete: ${totalCount} records written to ${OUTPUT_FILE}`);
    });

    writeStream.on("error", (err) => {
      console.error("❌ Write stream error:", err);
    });
  } catch (err) {
    console.error("❌ Export failed:", err);
  }
}

exportFirestoreToJsonFile();
