/**
 * GOOGLE APPS SCRIPT (GAS) - Edu_Share HUB (SMK BUKIT BARU)
 *
 * Fungsi Utama:
 * 1. Pintu Muat Naik Drive Sekolah (Drive Relay):
 *    Menerima fail (PDF, Word, Excel, PowerPoint, Imej, Video <= 25MB) daripada guru
 *    dan menyimpannya terus ke 4 folder Google Drive pentadbir TANPA memerlukan
 *    guru lain membuat pengesahan OAuth Google Drive atau berkongsi akses Editor.
 * 2. Sandaran Rekod Pautan Luar (BAHAN LINK) dalam format .txt.
 * 3. Log Rekod Automatik ke dalam Google Sheets ("MMI_Records").
 *
 * Arahan Pemasangan:
 * 1. Buka Google Sheets di akaun Google pemilik 4 folder Drive tersebut.
 *    Namakan fail Sheets: "Edu_Share HUB Rekod Bahan Sekolah".
 * 2. Klik menu Extensions -> Apps Script.
 * 3. Padam kod asal, salin dan tampal keseluruhan kod ini ke dalam Code.gs, kemudian Save.
 * 4. Klik "Deploy" -> "New deployment" -> Pilih jenis "Web app".
 * 5. Tetapkan:
 *    - Execute as: "Me" (Akaun pemilik folder Drive)
 *    - Who has access: "Anyone"
 * 6. Klik "Deploy", sahkan kebenaran Drive & Sheets pada akaun pemilik SEKALI SAHAJA.
 * 7. Salin Web App URL (https://script.google.com/macros/s/.../exec) dan masukkan
 *    ke dalam pemboleh ubah persekitaran / Secrets sebagai VITE_GAS_WEBHOOK_URL.
 */

var FOLDER_IDS = {
  LINK: "1MhGN2_MYb2PHhnd043Z_EcNFoP7u-tVc",
  PDF: "1Jk4N2prP84lc_Ju1PzJmxT7RXkLNct5-",
  VIDEO: "1dK4v9JcVoqbnkgQGahcd4do69bvn0lnt",
  OFFICE: "1RkCZ_SwA42ai-N8goMUYpbn-_pLtWhd0"
};

function resolveFolderId_(resourceType, fileName, mimeType) {
  var rType = (resourceType || "").toString();
  var lowerName = (fileName || "").toString().toLowerCase();
  var lowerMime = (mimeType || "").toString().toLowerCase();

  if (rType === "Pautan Luar") {
    return { id: FOLDER_IDS.LINK, label: "BAHAN LINK" };
  }
  if (rType === "PDF" || lowerName.slice(-4) === ".pdf" || lowerMime === "application/pdf") {
    return { id: FOLDER_IDS.PDF, label: "BAHAN PDF MMI" };
  }
  if (rType === "Video" || lowerMime.indexOf("video/") === 0) {
    return { id: FOLDER_IDS.VIDEO, label: "BAHAN VIDEO MMI" };
  }
  return { id: FOLDER_IDS.OFFICE, label: "BAHAN WORD,EXCEL MMI" };
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function appendToSheet_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  var sheet = ss.getSheetByName("MMI_Records");
  if (!sheet) {
    sheet = ss.insertSheet("MMI_Records");
    sheet.appendRow([
      "Tarikh & Masa",
      "ID Bahan",
      "Tajuk Bahan",
      "Mata Pelajaran",
      "Tingkatan",
      "Kategori",
      "Format Fail",
      "Nama Guru Penyumbang",
      "Emel Guru",
      "URL Bahan / Dokumen",
      "Catatan Arahan MMI"
    ]);
    var headerRange = sheet.getRange(1, 1, 1, 11);
    headerRange.setBackground("#0d9488");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
  }

  sheet.appendRow([
    new Date(),
    data.id || "N/A",
    data.title || "",
    data.subjectName || "",
    data.form || "",
    data.category === "digital" ? "Digital" : "Bukan Digital",
    data.resourceType || "",
    data.ownerName || "",
    data.ownerEmail || "",
    data.fileUrl || data.externalUrl || "",
    data.description || ""
  ]);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(25000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({
        status: "error",
        message: "Tiada data diterima."
      });
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || "log_sheet";

    // Tindakan 1: Muat naik fail binari (PDF, Word, Excel, Slaid, Imej, Video) terus ke Drive pemilik
    if (action === "upload_drive_file") {
      if (!data.fileBase64 || !data.fileName) {
        return jsonResponse_({
          status: "error",
          message: "Data fail tidak lengkap."
        });
      }

      var target = resolveFolderId_(data.resourceType, data.fileName, data.mimeType);
      var bytes = Utilities.base64Decode(data.fileBase64);
      var blob = Utilities.newBlob(
        bytes,
        data.mimeType || "application/octet-stream",
        data.fileName
      );

      var folder = DriveApp.getFolderById(target.id);
      var driveFile = folder.createFile(blob);

      try {
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        // Abaikan jika polisi organisasi menyekat perkongsian umum
      }

      return jsonResponse_({
        status: "success",
        fileId: driveFile.getId(),
        fileName: driveFile.getName(),
        webViewLink: driveFile.getUrl(),
        folderId: target.id,
        folderLabel: target.label
      });
    }

    // Tindakan 2: Simpan fail rekod sandaran .txt bagi Pautan Luar ke folder BAHAN LINK
    if (action === "upload_link_backup") {
      var safeTitle = (data.title || "BAHAN_LINK_MMI")
        .replace(/[^a-zA-Z0-9_\- ]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 60) || "BAHAN_LINK_MMI";
      var linkFileName = safeTitle + "_" + new Date().getTime() + ".txt";

      var content = [
        "Edu_Share HUB — SMK BUKIT BARU",
        "REKOD BAHAN PAUTAN LUAR (MMI)",
        "====================================================",
        "TAJUK          : " + (data.title || ""),
        "MATA PELAJARAN : " + (data.subjectName || ""),
        "TINGKATAN      : " + (data.form || ""),
        "PAUTAN URL     : " + (data.externalUrl || ""),
        "PENYUMBANG     : " + (data.ownerName || "") + " (" + (data.ownerEmail || "") + ")",
        "TARIKH REKOD   : " + new Date().toLocaleString("ms-MY"),
        "----------------------------------------------------",
        "PENERANGAN & PANDUAN GURU PENGGANTI:",
        data.description || "",
        "===================================================="
      ].join("\n");

      var linkFolder = DriveApp.getFolderById(FOLDER_IDS.LINK);
      var txtFile = linkFolder.createFile(linkFileName, content, MimeType.PLAIN_TEXT);

      return jsonResponse_({
        status: "success",
        fileId: txtFile.getId(),
        fileName: txtFile.getName(),
        webViewLink: txtFile.getUrl(),
        folderId: FOLDER_IDS.LINK,
        folderLabel: "BAHAN LINK"
      });
    }

    // Tindakan 3 (Lalai): Log rekod bahan ke dalam Google Sheets
    appendToSheet_(data);

    return jsonResponse_({
      status: "success",
      message: "Rekod berjaya diselaraskan ke Google Sheets."
    });
  } catch (error) {
    return jsonResponse_({
      status: "error",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return jsonResponse_({
    status: "ok",
    service: "Edu_Share HUB Drive Relay & Sheets Sync",
    active: true
  });
}
