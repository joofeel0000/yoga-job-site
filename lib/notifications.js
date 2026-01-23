import { supabase } from './supabase';

// 지원 알림 생성
export async function createApplicationNotification(jobOwnerId, jobTitle, applicationId) {
  await supabase
    .from('notifications')
    .insert([{
      user_id: jobOwnerId,
      type: 'application',
      item_id: applicationId,
      title: '새로운 지원이 있습니다!',
      message: `"${jobTitle}" 공고에 지원자가 있습니다.`
    }]);
}

// 연락 알림 생성
export async function createContactNotification(resumeOwnerId, resumeName, contactId) {
  await supabase
    .from('notifications')
    .insert([{
      user_id: resumeOwnerId,
      type: 'contact',
      item_id: contactId,
      title: '새로운 연락이 있습니다!',
      message: `"${resumeName}" 이력서에 센터에서 연락이 왔습니다.`
    }]);
}