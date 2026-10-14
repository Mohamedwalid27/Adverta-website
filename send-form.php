<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function respond(int $status, array $data): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['success'=>false,'message'=>'Use the form to submit a request.']);
if (!empty($_POST['company_fax'] ?? '')) respond(200, ['success'=>true,'message'=>'Thank you. Your request has been received.']);
$started = filter_var($_POST['form_started'] ?? '', FILTER_VALIDATE_INT);
if ($started && (time() - $started) < 3) respond(429, ['success'=>false,'message'=>'Please wait a moment and submit again.']);
function clean(string $key, int $max=1000): string {
  $value = trim((string)($_POST[$key] ?? ''));
  $value = preg_replace('/[\r\n]+/', ' ', $value) ?? '';
  return mb_substr($value, 0, $max, 'UTF-8');
}
$name = clean('full_name',100);
$brand = clean('brand_name',120);
$website = clean('website',240);
$industry = clean('industry',120);
$spend = clean('monthly_spend',120);
$goal = clean('goal',1000);
$phone = clean('phone',30);
$formType = clean('form_type',40);
$track = clean('track',80);
$requestType = clean('request_type',80);
$consent = clean('consent',10);
$platforms = $_POST['platforms'] ?? [];
if (!is_array($platforms)) $platforms = [];
$allowedPlatforms = ['Meta','TikTok','Google','None'];
$platforms = array_values(array_unique(array_filter(array_map('strval',$platforms), fn($v)=>in_array($v,$allowedPlatforms,true))));
$isWaitlist = ($formType === 'coaching_waitlist');
if ($name === '' || $phone === '') respond(422,['success'=>false,'message'=>'Please complete your name and phone number.']);
if (strlen($phone) < 7) respond(422,['success'=>false,'message'=>'Please enter a valid phone / WhatsApp number.']);
if ($isWaitlist) {
  if ($track === '') respond(422,['success'=>false,'message'=>'Please select a coaching track.']);
  $subject = 'ADVERTA Coaching Waitlist Request';
  $body = "Coaching waitlist request\n\nName: {$name}\nPhone: {$phone}\nTrack: {$track}\n";
  $event = 'waitlist_submit';
} else {
  if ($brand === '' || $industry === '' || $spend === '') respond(422,['success'=>false,'message'=>'Please complete all required audit fields, including monthly ad spend.']);
  if ($consent !== 'yes') respond(422,['success'=>false,'message'=>'Please confirm that ADVERTA may contact you.']);
  if (count($platforms) === 0) respond(422,['success'=>false,'message'=>'Please select at least one platform or None.']);
  if (in_array('None',$platforms,true) && count($platforms) > 1) respond(422,['success'=>false,'message'=>'Choose None by itself, or select the platforms you currently use.']);
  if ($website !== '' && !preg_match('/^(@[A-Za-z0-9._]+|https?:\/\/|www\.)/i',$website)) respond(422,['success'=>false,'message'=>'Enter a website URL or Instagram handle beginning with @.']);
  $subject = 'ADVERTA Free Ad Account Audit Request';
  $body = "Free ad account audit request\n\nName: {$name}\nBrand: {$brand}\nWebsite / Instagram: {$website}\nIndustry: {$industry}\nPlatforms: ".implode(', ',$platforms)."\nMonthly ad spend: {$spend}\nMain problem / goal: {$goal}\nPhone / WhatsApp: {$phone}\nRequest type: {$requestType}\nConsent: yes\n";
  $event = 'audit_form_submit';
}
$to = 'adverta.co11@gmail.com';
$host = preg_replace('/[^A-Za-z0-9.-]/','', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
$fromDomain = $host ?: 'localhost';
$from = 'website@' . $fromDomain;
$headers = ["From: ADVERTA Website <{$from}>","Reply-To: {$from}","Content-Type: text/plain; charset=UTF-8","X-Mailer: PHP/" . phpversion()];
$sent = @mail($to, $subject, $body, implode("\r\n",$headers));
if (!$sent) respond(500,['success'=>false,'message'=>'The website could not send the email right now. Please use the WhatsApp button instead.']);
respond(200,['success'=>true,'message'=>$isWaitlist ? 'Thank you — your coaching waitlist request has been sent.' : 'Thank you — your audit request has been sent. ADVERTA will follow up using the contact details you provided.','event'=>$event]);
?>