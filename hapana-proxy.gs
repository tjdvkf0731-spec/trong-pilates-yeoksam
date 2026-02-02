// ==================================================
// Strong Pilates - Hapana CRM 연동 백엔드
// Google Apps Script로 배포
// ==================================================

// Hapana API 설정
const HAPANA_API_KEY = 'MzEyNTY1Ng==';
const HAPANA_API_URL = 'https://api.hapana.com/v1/clients';

// POST 요청 처리 (폼 제출)
function doPost(e) {
  try {
    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    // Hapana API로 Client 등록
    const hapanaResponse = registerToHapana(data);
    
    // 스프레드시트에도 백업 저장
    saveToSheet(data);
    
    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '등록 완료' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Hapana API로 Client 등록
function registerToHapana(data) {
  const payload = {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    send_welcome_email: true
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + HAPANA_API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(HAPANA_API_URL, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode >= 200 && responseCode < 300) {
    return JSON.parse(response.getContentText());
  } else {
    Logger.log('Hapana API Error: ' + response.getContentText());
    throw new Error('Hapana 등록 실패: ' + responseCode);
  }
}

// 스프레드시트에 백업 저장
function saveToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  sheet.appendRow([
    new Date(),              // 등록 일시
    data.firstName,          // 이름
    data.lastName,           // 성
    data.email,              // 이메일
    data.phone,              // 연락처
    data.marketingConsent    // 마케팅 동의
  ]);
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'Strong Pilates API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 스프레드시트 헤더 설정 (처음 한 번만 실행)
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(1, 1, 1, 6).setValues([[
    '등록일시', '이름', '성', '이메일', '연락처', '마케팅동의'
  ]]);
  sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
}
