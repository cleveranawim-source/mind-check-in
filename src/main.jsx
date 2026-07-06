import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import "./styles.css";

const scale = [
  { value: 0, label: "전혀 아님" },
  { value: 1, label: "가끔" },
  { value: 2, label: "보통" },
  { value: 3, label: "자주" },
  { value: 4, label: "거의 매일" },
];

const domains = {
  depletion: "소진/에너지 고갈",
  anxiety: "불안/과각성",
  mood: "우울/위축",
  anger: "분노/예민함",
  injury: "무력감/도덕적 상처",
  trauma: "침습 기억/위협 반응",
};

const questions = [
  { id: "q1", domain: "depletion", text: "수업 전부터 이미 기운이 바닥난 느낌이 든다." },
  { id: "q2", domain: "depletion", text: "퇴근 후에도 회복이 되지 않고 다음 날까지 피로가 이어진다." },
  { id: "q3", domain: "depletion", text: "예전보다 학생에게 따뜻하게 반응할 여유가 줄었다." },
  { id: "q4", domain: "depletion", text: "해야 할 일을 생각하면 시작하기 전부터 압도된다." },
  { id: "q5", domain: "depletion", text: "쉬는 시간에도 실제로 쉬지 못하고 계속 업무를 떠올린다." },
  { id: "q6", domain: "depletion", text: "결근, 병가, 휴직을 생각할 만큼 버티는 힘이 줄었다." },
  { id: "q7", domain: "anxiety", text: "민원, 연락, 관리자 호출을 떠올리면 몸이 먼저 긴장한다." },
  { id: "q8", domain: "anxiety", text: "작은 실수도 큰 문제로 번질 것 같아 계속 확인한다." },
  { id: "q9", domain: "anxiety", text: "잠들기 전 학교 일을 반복해서 떠올리며 불안해진다." },
  { id: "q10", domain: "anxiety", text: "보호자나 학생에게 보낼 문장을 여러 번 고치느라 시간이 오래 걸린다." },
  { id: "q11", domain: "anxiety", text: "학교 알림, 전화, 메시지 소리만 들어도 심장이 뛰거나 긴장된다." },
  { id: "q12", domain: "anxiety", text: "문제가 생길까 봐 새로운 시도나 필요한 대화를 피하게 된다." },
  { id: "q13", domain: "mood", text: "기쁨, 보람, 흥미가 전보다 뚜렷하게 줄었다." },
  { id: "q14", domain: "mood", text: "스스로를 탓하거나 교사로서 실패했다는 생각이 자주 든다." },
  { id: "q15", domain: "mood", text: "사람을 만나는 일이 부담스러워 혼자 있고 싶어진다." },
  { id: "q16", domain: "mood", text: "학생의 긍정적인 반응을 봐도 마음에 잘 들어오지 않는다." },
  { id: "q17", domain: "mood", text: "아침에 일어날 때 하루를 시작하는 것이 무겁고 막막하다." },
  { id: "q18", domain: "mood", text: "나아질 수 있다는 기대보다 계속 이렇게 갈 것 같다는 생각이 크다." },
  { id: "q19", domain: "anger", text: "말투가 날카로워지고, 평소보다 쉽게 욱한다." },
  { id: "q20", domain: "anger", text: "퇴근 후에도 특정 학생, 보호자, 상황에 대한 분노가 가라앉지 않는다." },
  { id: "q21", domain: "anger", text: "감정을 억누르다가 한 번에 폭발할까 봐 걱정된다." },
  { id: "q22", domain: "anger", text: "상대의 말뜻을 확인하기 전에 공격이나 비난처럼 느껴질 때가 많다." },
  { id: "q23", domain: "anger", text: "수업이나 상담 중 단호함과 차가움의 경계가 흐려진다." },
  { id: "q24", domain: "anger", text: "내가 참고 있다는 사실을 아무도 알아주지 않는다는 억울함이 크다." },
  { id: "q25", domain: "injury", text: "옳다고 믿는 교육적 판단을 지킬 수 없다는 무력감을 느낀다." },
  { id: "q26", domain: "injury", text: "학교 시스템이 나를 보호하지 못한다는 생각이 강하다." },
  { id: "q27", domain: "injury", text: "교직의 의미가 흔들리고, 떠나야 하나 고민한다." },
  { id: "q28", domain: "injury", text: "학생을 위해 한 선택이 오히려 문제로 돌아올까 봐 위축된다." },
  { id: "q29", domain: "injury", text: "부당하다고 느낀 일을 설명해도 이해받지 못할 것 같다." },
  { id: "q30", domain: "injury", text: "내가 중요하게 여기는 교육적 가치가 학교 현실에서 계속 손상된다고 느낀다." },
  { id: "q31", domain: "trauma", text: "힘들었던 사건 장면이나 말이 갑자기 떠올라 몸이 굳는다." },
  { id: "q32", domain: "trauma", text: "비슷한 장소, 사람, 연락만 봐도 피하고 싶거나 과하게 경계한다." },
  { id: "q33", domain: "trauma", text: "사건 이후 수면, 식사, 집중, 신체 긴장이 눈에 띄게 흔들렸다." },
  { id: "q34", domain: "trauma", text: "그 사건을 떠올리게 하는 업무나 공간을 최대한 피하게 된다." },
  { id: "q35", domain: "trauma", text: "머리로는 끝난 일이라고 알아도 몸은 아직 안전하지 않다고 느낀다." },
  { id: "q36", domain: "trauma", text: "갑작스러운 소리, 표정, 문장에 과하게 놀라거나 얼어붙는다." },
];

const riskQuestions = [
  { id: "r1", text: "최근 2주 안에 사라지고 싶다는 생각을 한 적이 있었다." },
  { id: "r2", text: "나 자신이나 타인을 해칠까 봐 두려운 순간이 있었다." },
  { id: "r3", text: "술, 약물, 수면제 등에 기대지 않으면 버티기 어렵다고 느낀다." },
];

const evidenceItems = [
  {
    title: "자가검진의 목적",
    body:
      "이 도구는 진단명이 아니라 위험 영역을 선별하는 1차 점검 구조입니다. 국가정신건강정보포털의 자가검진처럼 전반 위험을 먼저 보고, 필요 시 정밀 평가와 전문 상담으로 연결하는 흐름을 따릅니다.",
  },
  {
    title: "소진 영역의 근거",
    body:
      "소진은 WHO ICD-11에서 직업 맥락의 현상으로 설명되며, 에너지 고갈, 일과의 심리적 거리감/냉소, 직무 효능감 저하라는 세 축으로 정리됩니다. 교사 도구에서는 이를 회복 고갈, 정서적 거리감, 업무 효능감 흔들림 문항으로 반영했습니다.",
  },
  {
    title: "교사 직무 맥락",
    body:
      "교사의 마음건강은 일반 스트레스만으로 설명하기 어렵습니다. 민원·관계·생활지도·조직 보호감·교육적 신념 손상이 함께 작동하므로 불안, 분노, 도덕적 상처, 사건 후유 반응을 별도 축으로 분리했습니다.",
  },
  {
    title: "해석의 한계",
    body:
      "현재 버전은 임상 표준화 검사가 아니며 민감도, 특이도, 규준 점수가 검증된 상태가 아닙니다. 따라서 결과는 자기이해와 상담 준비 자료로 사용하고, 진단·치료 결정은 전문가 평가가 필요합니다.",
  },
];

const profiles = {
  depletion: {
    title: "회복 고갈형",
    subtitle: "좋은 교사로 버티느라 몸과 마음의 연료가 먼저 소진된 상태",
    description:
      "회복 고갈형은 의지나 책임감이 부족해서 생기는 상태가 아니라, 오랫동안 높은 책임을 유지하는 동안 회복 자원이 먼저 바닥난 상태에 가깝습니다. 교사는 수업, 생활지도, 민원, 행정, 관계 조정까지 동시에 감당하기 때문에 몸은 쉬어도 머리는 계속 학교 일을 처리하는 방식으로 긴장이 남기 쉽습니다. 이 유형에서는 '더 열심히 해야 한다'보다 '회복 가능한 업무 기준을 다시 세우는 것'이 핵심입니다. 특히 퇴근 후에도 회복감이 없고, 학생에게 따뜻하게 반응할 여유가 줄었다면 개인의 성격 문제가 아니라 에너지 체계가 과부하를 보내는 신호로 이해하는 것이 좋습니다.",
    immediate: ["오늘 처리할 일 3개만 남기고 나머지는 내일 목록으로 이동", "퇴근 후 학교 메신저 확인 시간을 한 번으로 제한", "10분 걷기, 물, 식사처럼 몸을 먼저 회복시키는 행동 선택"],
    weekly: ["업무를 중요/긴급/위임/보류로 재분류", "수업 준비 기준을 100점에서 70점 운영 가능 수준으로 낮추기", "동학년 또는 부장에게 반복 업무 1가지를 구체적으로 나누어 요청"],
    therapy:
      "2주 이상 회복되지 않거나 결근, 불면, 신체증상이 동반되면 상담센터 또는 정신건강의학과에서 스트레스 평가와 치료 계획을 상의하세요.",
    dialogue: {
      colleague: "요즘 체력이 먼저 무너져서 수업 운영 기준을 낮추고 있어요. 이번 주에는 자료 공유나 생활지도 역할을 조금 나눌 수 있을까요?",
      leader: "현재 업무량 때문에 회복 시간이 확보되지 않습니다. 이번 달 필수 업무와 조정 가능한 업무를 함께 구분하고 싶습니다.",
      counselor: "피로가 오래가고 교사 역할에 냉담해지는 느낌이 있습니다. 소진인지, 우울/불안이 함께 있는지 평가받고 싶습니다.",
    },
  },
  anxiety: {
    title: "경계 과부하형",
    subtitle: "문제가 생기기 전에 막으려다 긴장 시스템이 계속 켜진 상태",
    description:
      "경계 과부하형은 문제가 생기지 않도록 미리 대비하려는 마음이 지나치게 오래 켜져 있는 상태입니다. 학교에서는 작은 말 한마디, 기록 하나, 보호자 연락 하나가 큰 문제로 번질 수 있다는 압박이 있기 때문에 뇌가 계속 위험을 예측하고 확인하려고 합니다. 이때 반복 확인, 문장 수정, 연락 회피, 잠들기 전 걱정은 모두 불안을 낮추기 위한 시도이지만, 장기적으로는 '확인하지 않으면 위험하다'는 회로를 더 강하게 만들 수 있습니다. 이 유형의 핵심은 불안을 없애는 것이 아니라 사실, 추정, 대응을 분리해 실제로 다룰 수 있는 범위를 좁히는 것입니다.",
    immediate: ["불안 생각을 사실/추정/대응으로 나누어 적기", "호흡을 길게 내쉬며 어깨와 턱 긴장을 90초 낮추기", "메시지 답장은 초안 작성 후 10분 뒤 재확인"],
    weekly: ["자주 걱정되는 상황의 표준 문구 만들기", "민원 가능성이 있는 사안은 혼자 판단하지 않고 기록-공유-확인 루틴화", "불안을 줄이기 위한 과도한 재확인 행동 1개 줄이기"],
    therapy:
      "공황, 불면, 강박적 확인, 회피가 생활을 방해하면 인지행동치료, 이완훈련, 필요 시 약물치료를 전문가와 논의할 수 있습니다.",
    dialogue: {
      colleague: "제가 요즘 사안을 크게 예측해서 긴장하는 경향이 있어요. 이 사안을 사실 기준으로 같이 한 번만 검토해줄 수 있을까요?",
      leader: "보호자 대응 전 학교 차원의 일관된 답변 범위를 확인하고 싶습니다. 제 개인 판단으로만 처리하지 않겠습니다.",
      counselor: "확인과 걱정이 반복되어 잠과 집중에 영향을 줍니다. 불안 조절을 위한 치료적 방법을 배우고 싶습니다.",
    },
  },
  mood: {
    title: "의미 저하형",
    subtitle: "보람과 흥미가 낮아지고 자기비난이 커진 상태",
    description:
      "의미 저하형은 단순히 기분이 나쁜 상태라기보다, 보람을 느끼는 능력과 자신을 지지하는 힘이 함께 낮아진 상태입니다. 교사에게는 우울감이 '슬프다'보다 '내가 교사로서 부족하다', '학생에게 도움이 되지 못한다', '계속 이렇게 살 것 같다'는 자기비난의 언어로 나타나는 경우가 많습니다. 평소라면 힘이 되었던 학생의 반응이나 수업의 작은 성공이 마음에 들어오지 않고, 하루를 시작하는 것 자체가 무겁게 느껴질 수 있습니다. 이 유형은 마음가짐을 고쳐야 한다는 신호가 아니라, 흥미와 에너지, 수면, 자기평가를 함께 회복해야 한다는 신호로 보는 것이 안전합니다.",
    immediate: ["자기비난 문장을 사실 문장으로 바꾸기", "하루 중 반드시 끝낼 수 있는 작은 행동 1개 완료", "혼자 견디지 않기 위해 신뢰 가능한 한 사람에게 상태 알리기"],
    weekly: ["수면-식사-움직임 기록으로 생체 리듬부터 회복", "수업에서 작은 성공 장면 1개만 따로 기록", "상담 예약, 병가 상담, 업무 조정 가능성 확인"],
    therapy:
      "우울감, 흥미 저하, 무가치감이 2주 이상 이어지거나 자해 생각이 있으면 즉시 전문 평가가 필요합니다. 상담과 진료는 약함의 표시가 아니라 회복 절차입니다.",
    dialogue: {
      colleague: "요즘 제 상태가 생각보다 낮아서 혼자 판단하면 더 가라앉을 것 같아요. 이번 주에 한 번만 제 업무 우선순위를 같이 봐줄 수 있을까요?",
      leader: "최근 집중과 수면이 흔들려 업무 지속성이 떨어지고 있습니다. 상담 또는 병가 사용 가능 절차를 확인하고 싶습니다.",
      counselor: "무기력과 자기비난이 이어집니다. 우울 평가와 치료 선택지를 함께 검토하고 싶습니다.",
    },
  },
  anger: {
    title: "감정 압력형",
    subtitle: "참아온 억울함과 긴장이 분노로 새어 나오는 상태",
    description:
      "감정 압력형은 분노 자체가 문제가 되었다기보다, 오랫동안 참고 넘긴 억울함과 경계 침해가 압력처럼 쌓인 상태입니다. 교사는 학생, 보호자, 동료, 관리자 사이에서 감정을 조절해야 하는 위치에 자주 놓이기 때문에 화가 나도 바로 표현하지 못하고 삼키는 일이 많습니다. 그러다 보면 작은 말이나 표정에도 몸이 먼저 반응하고, 단호함과 차가움의 경계가 흐려질 수 있습니다. 이 유형에서는 분노를 없애는 것보다 '무엇이 침해되었는지', '지금 바로 말해야 하는지', '어떤 절차와 문장으로 표현할지'를 분리하는 것이 중요합니다. 분노는 관계를 망치라는 신호가 아니라, 경계를 다시 세우라는 신호일 수 있습니다.",
    immediate: ["답변 전 물리적 거리 2m 또는 시간 20분 확보", "감정 단어를 '화남'보다 구체적으로 명명하기", "지금 해결할 문제와 나중에 다룰 문제 분리"],
    weekly: ["반복되는 분노 상황의 촉발 조건 찾기", "학생/보호자 대응 문장을 사전에 짧게 준비", "사과가 필요한 상황과 경계 설정이 필요한 상황 구분"],
    therapy:
      "분노 폭발, 충동, 관계 손상이 반복되면 상담에서 감정조절 훈련과 대인관계 기술을 연습하는 것이 도움이 됩니다.",
    dialogue: {
      colleague: "이 사안에 감정이 많이 올라와서 바로 대응하면 말이 세질 것 같아요. 기록을 먼저 정리한 뒤 같이 검토해도 될까요?",
      leader: "해당 상황은 제 감정 조절만의 문제가 아니라 반복되는 업무 경계 문제입니다. 대응 기준과 보호 절차가 필요합니다.",
      counselor: "분노를 참다가 폭발할까 봐 걱정됩니다. 감정조절과 경계 표현 방법을 연습하고 싶습니다.",
    },
  },
  injury: {
    title: "도덕적 상처형",
    subtitle: "교육적 신념과 현실 사이의 충돌로 마음이 다친 상태",
    description:
      "도덕적 상처형은 단순 스트레스보다 더 깊게, 교사로서 중요하게 여겨 온 가치가 현실에서 반복적으로 손상될 때 나타나는 반응입니다. '내가 잘못했다'는 죄책감만이 아니라 '옳다고 믿는 교육적 판단을 지킬 수 없었다', '학교가 나를 보호하지 못했다', '이 일을 계속하는 의미가 흔들린다'는 배신감과 무력감이 함께 생길 수 있습니다. 이 유형은 개인의 회복 노력만으로 설명하기 어렵고, 조직의 절차, 보호감, 동료의 증언, 공정한 기록이 함께 필요합니다. 따라서 스스로를 설득해 버티기보다 내 책임과 시스템 책임을 구분하고, 사실 기록과 공식 지원 경로를 확보하는 것이 중요합니다.",
    immediate: ["내 책임과 시스템 책임을 분리해 적기", "사건 기록을 감정 평가 없이 사실 중심으로 보존", "혼자 판단하지 않고 신뢰 가능한 공식 라인에 공유"],
    weekly: ["교권보호, 민원 대응, 상담 지원 절차 확인", "나의 교육 철학 중 지금도 지킬 수 있는 최소 단위 재정의", "동료 1명과 사건의 의미를 안전하게 말로 정리"],
    therapy:
      "무력감, 배신감, 직업 정체성 붕괴가 지속되면 트라우마-informed 상담이나 직무 스트레스 상담이 필요할 수 있습니다.",
    dialogue: {
      colleague: "이 일은 단순히 힘든 일이 아니라 제 교육적 기준이 무너진 느낌입니다. 사실 정리와 절차 확인을 같이 해줄 수 있을까요?",
      leader: "개인 회복만으로 해결하기 어렵습니다. 학교 차원의 보호 조치와 재발 방지 절차를 확인하고 싶습니다.",
      counselor: "교직 의미가 흔들릴 만큼 상처가 큽니다. 사건을 어떻게 받아들이고 회복할지 전문적으로 다루고 싶습니다.",
    },
  },
  trauma: {
    title: "사건 후유 반응형",
    subtitle: "위협적 사건 이후 몸과 기억이 아직 안전을 확인하지 못한 상태",
    description:
      "사건 후유 반응형은 특정 사건이 끝난 뒤에도 몸과 기억이 아직 안전을 충분히 확인하지 못한 상태입니다. 머리로는 '지나간 일'이라고 이해해도, 비슷한 장소, 말투, 알림음, 사람을 만났을 때 몸이 얼어붙거나 피하고 싶어질 수 있습니다. 이는 약해서 생기는 반응이 아니라 위협을 경험한 신경계가 다시 위험을 피하려는 자연스러운 보호 반응입니다. 다만 침습 기억, 회피, 과각성, 수면 변화가 계속되면 일상 기능과 수업 장면에 영향을 줄 수 있으므로 혼자 노출을 감당하기보다 안전 동반자, 업무 조정, 트라우마를 다룰 수 있는 전문 상담을 함께 고려하는 것이 좋습니다.",
    immediate: ["지금 있는 장소, 날짜, 발바닥 감각을 말하며 현재로 돌아오기", "사건 관련 연락/공간 노출을 혼자 감당하지 않기", "수면과 식사를 회복 목표 1순위로 두기"],
    weekly: ["사건 기록과 감정 기록을 분리", "학교 내 안전 동선과 대응 동반자 정하기", "트라우마 경험을 다루는 상담/진료 예약"],
    therapy:
      "악몽, 플래시백, 회피, 과각성이 1개월 안팎으로 지속되거나 일상 기능이 떨어지면 트라우마 평가와 치료를 권합니다.",
    dialogue: {
      colleague: "비슷한 장면만 봐도 몸이 먼저 반응합니다. 당분간 관련 대응에 혼자 들어가지 않도록 동행을 부탁하고 싶습니다.",
      leader: "사건 후유 반응으로 업무 수행에 영향이 있습니다. 안전 조치와 상담 연계, 업무 조정이 필요합니다.",
      counselor: "사건 이후 기억과 몸 반응이 반복됩니다. 트라우마 평가와 치료 방법을 상담받고 싶습니다.",
    },
  },
};

const typeMarks = {
  depletion: "🌿",
  anxiety: "🫧",
  mood: "☀️",
  anger: "🧭",
  injury: "🤲",
  trauma: "🕯️",
};

function makeDetailProfiles(keys) {
  return keys.map((key) => {
    const profile = profiles[key];
    return {
      key,
      mark: typeMarks[key],
      title: profile.title,
      subtitle: profile.subtitle,
      description: profile.description,
      immediate: profile.immediate,
      weekly: profile.weekly,
    };
  });
}

function buildOverlapExplanation(keys) {
  const titles = keys.map((key) => profiles[key].title);
  const joined = titles.join(", ");

  if (keys.includes("depletion") && keys.includes("anxiety")) {
    return "회복 고갈형과 경계 과부하형이 함께 높으면, 에너지는 이미 많이 줄어 있는데 머리와 몸은 계속 위험을 예측하느라 꺼지지 않는 상태일 수 있습니다. 쉬어도 회복되지 않고, 동시에 메시지나 민원, 기록, 관리자 호출 같은 자극에 계속 긴장하는 식입니다. 이 조합에서는 단순히 '푹 쉬세요'만으로는 부족할 수 있습니다. 업무 기준을 낮추어 실제 에너지 지출을 줄이는 것과, 불안을 낮추기 위한 과도한 확인 행동을 줄이는 것이 함께 필요합니다.";
  }

  if (keys.includes("depletion") && keys.includes("mood")) {
    return "회복 고갈형과 의미 저하형이 함께 높으면, 몸의 에너지가 바닥난 상태가 자기비난과 무기력으로 이어지고 있을 수 있습니다. 이때는 '나는 왜 이렇게 못 버티지'가 아니라 '회복 자원이 부족해서 보람을 느끼는 기능까지 낮아졌구나'라고 해석하는 편이 안전합니다. 충분한 수면, 식사, 업무량 조정 같은 생리적 회복과 함께, 스스로를 비난하는 문장을 사실 중심 문장으로 바꾸는 작업이 중요합니다.";
  }

  if (keys.includes("anger") && keys.includes("injury")) {
    return "감정 압력형과 도덕적 상처형이 함께 높으면, 단순히 화가 많은 상태가 아니라 '중요한 교육적 가치가 손상되었다'는 억울함과 배신감이 분노로 올라오는 상태일 수 있습니다. 이 조합에서는 감정을 참으라고만 하면 오히려 상처가 더 깊어질 수 있습니다. 무엇이 부당했는지, 어떤 절차가 필요했는지, 학교 차원의 보호와 기록이 어떻게 마련되어야 하는지를 함께 정리하는 것이 좋습니다.";
  }

  if (keys.includes("anxiety") && keys.includes("trauma")) {
    return "경계 과부하형과 사건 후유 반응형이 함께 높으면, 현재의 걱정만이 아니라 이전에 겪은 강한 사건의 기억과 몸 반응이 지금의 긴장을 키우고 있을 수 있습니다. 비슷한 말투, 연락, 장소, 알림음에 몸이 먼저 반응한다면 단순 예민함으로 넘기기보다 안전감을 회복하는 절차가 필요합니다. 혼자 노출을 견디기보다 동행, 업무 조정, 전문 상담을 통해 신경계가 다시 안전을 확인할 시간을 주는 것이 중요합니다.";
  }

  return `${joined}이 함께 높게 나타났습니다. 이 결과는 마음 상태를 하나의 이름으로 단순화하기보다, 여러 회복 과제가 동시에 작동하고 있음을 보여줍니다. 교사의 마음건강은 수업, 생활지도, 민원, 조직 보호감, 사건 경험, 개인의 수면과 체력 상태가 서로 겹쳐 나타나는 경우가 많습니다. 따라서 동점 영역 각각을 모두 읽고, 공통으로 반복되는 장면을 찾아보는 것이 좋습니다. 가장 먼저 할 일은 모든 문제를 한 번에 해결하는 것이 아니라, 오늘 기능을 가장 많이 흔드는 신호 하나를 고르고 그 신호를 낮출 수 있는 작은 조정부터 시작하는 것입니다.`;
}

function scoreAnswers(answers, risks) {
  const totals = Object.fromEntries(Object.keys(domains).map((key) => [key, 0]));
  const counts = Object.fromEntries(Object.keys(domains).map((key) => [key, 0]));

  questions.forEach((question) => {
    totals[question.domain] += answers[question.id] ?? 0;
    counts[question.domain] += 1;
  });

  const domainScores = Object.fromEntries(
    Object.entries(totals).map(([key, value]) => [key, Math.round((value / (counts[key] * 4)) * 100)])
  );
  const sorted = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];
  const secondary = sorted[1][0];
  const topScore = sorted[0][1];
  const topTies = sorted.filter(([, value]) => value === topScore).map(([key]) => key);
  const highDomains = sorted.filter(([, value]) => value >= 70).map(([key]) => key);
  const allHigh = highDomains.length === Object.keys(domains).length;
  const total = questions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
  const overallScore = Math.round((total / (questions.length * 4)) * 100);
  const severity = overallScore >= 70 ? "높음" : overallScore >= 50 ? "주의" : overallScore >= 30 ? "관찰" : "낮음";
  const riskFlag = Object.values(risks).some(Boolean);
  const composite = allHigh || (topTies.length > 1 && topScore >= 50);

  return { domainScores, sorted, top, secondary, topScore, topTies, highDomains, allHigh, composite, total, overallScore, severity, riskFlag };
}

function buildResultProfile(result) {
  if (result.allHigh) {
    const detailProfiles = makeDetailProfiles(result.sorted.map(([key]) => key));

    return {
      title: "전반 과부하형",
      subtitle: "여섯 영역이 모두 높게 올라와 단일 유형보다 전체 부담을 먼저 봐야 하는 상태",
      description:
        "전반 과부하형은 특정 유형 하나가 두드러진 상태라기보다, 마음건강을 지탱하는 여러 축이 동시에 부담을 받고 있다는 뜻입니다. 소진, 불안, 우울, 분노, 도덕적 상처, 사건 후유 반응이 함께 높다면 현재 상태를 '어떤 문제가 가장 큰가'로만 좁히기 어렵습니다. 이때는 성격, 태도, 의지의 문제가 아니라 업무량, 관계 긴장, 조직 보호감, 신체 회복, 사건 경험이 겹쳐 전체 조절 능력이 낮아진 상태로 이해하는 것이 안전합니다. 해석의 초점은 원인 분석보다 안전 확보, 수면과 식사 회복, 업무 조정, 신뢰할 수 있는 사람과의 연결을 먼저 만드는 데 있습니다.",
      signalLabel: "우선 신호",
      signalTitle: "전 영역 동시 상승",
      signalBody: "소진, 불안, 우울, 분노, 도덕적 상처, 사건 후유 반응이 함께 높습니다. 혼자 버티는 방식보다 업무 부담 조정과 전문적 도움을 함께 검토하는 편이 좋습니다.",
      detailTitle: "함께 높게 나타난 여섯 가지 신호",
      detailLead:
        "아래 설명은 각각의 신호가 어떤 의미인지 풀어쓴 것입니다. 전반 과부하형에서는 특정 설명 하나만 고르기보다, 여러 문단 중 '내 이야기처럼 느껴지는 부분'을 표시해 보는 방식이 도움이 됩니다.",
      detailProfiles,
      overlapExplanation:
        "전 영역이 동시에 높다는 것은 마음이 약하다는 뜻이 아니라, 회복 체계가 여러 방향에서 동시에 압박을 받고 있다는 뜻입니다. 이때는 원인을 하나로 찾으려 하기보다 안전, 수면, 업무 조정, 사람 연결을 함께 확보해야 합니다. 특히 위기 신호가 함께 체크되었다면 결과 해석보다 지금 곁에 있는 사람과 연결되는 것이 먼저입니다.",
      immediate: ["오늘 반드시 해야 할 일만 1~2개로 줄이기", "신뢰할 수 있는 사람에게 현재 점수와 상태를 그대로 공유하기", "수면, 식사, 안전 확인을 업무보다 먼저 배치하기"],
      weekly: ["관리자 또는 동료와 업무 조정이 필요한 항목을 구체적으로 나누기", "상담센터나 의료기관 등 외부 도움을 실제 일정으로 예약하기", "위기 신호가 있으면 결과 해석보다 즉시 사람에게 연결하기"],
      interpretation:
        "전반 과부하형은 특정 영역의 1등을 찾는 결과가 아닙니다. 지금은 세부 유형보다 전체 부담을 낮추는 조치가 우선입니다.",
    };
  }

  if (result.composite) {
    const tiedTitles = result.topTies.map((key) => profiles[key].title).join(", ");
    const detailProfiles = makeDetailProfiles(result.topTies);

    return {
      title: "복합 신호형",
      subtitle: "두 개 이상의 영역이 같은 최고점으로 나타난 상태",
      description:
        "복합 신호형은 최고점이 하나로 정리되지 않고 두 개 이상의 영역이 같은 강도로 올라온 상태입니다. 이는 검사 오류라기보다 실제 학교 현장에서 자주 나타나는 마음의 겹침에 가깝습니다. 예를 들어 소진과 불안이 함께 높으면 지쳐 있으면서도 계속 확인하게 되고, 분노와 도덕적 상처가 함께 높으면 억울함과 가치 손상이 동시에 작동할 수 있습니다. 따라서 결과를 억지로 한 유형으로 좁히기보다 동점 영역들이 어떤 장면에서 함께 올라오는지 살피고, 공통으로 필요한 회복 조건을 먼저 마련하는 접근이 적절합니다.",
      signalLabel: "동점 신호",
      signalTitle: tiedTitles,
      signalBody: "동점 영역은 모두 현재 상태를 설명하는 중요한 단서입니다. 결과를 하나로 좁히려 하기보다, 아래에 제시된 각 유형의 설명을 모두 읽고 공통으로 필요한 회복 조건을 확인하세요.",
      detailTitle: "함께 높게 나온 유형별 자세한 설명",
      detailLead:
        "복합신호형에서는 아래 유형들이 모두 중요합니다. 가장 높은 점수로 함께 나온 신호들이기 때문에, 한 가지 설명만 선택하지 말고 각각의 설명을 모두 읽어보는 것이 좋습니다.",
      detailProfiles,
      overlapExplanation: buildOverlapExplanation(result.topTies),
      immediate: ["가장 힘든 장면을 하나만 고르고 몸의 긴장을 먼저 낮추기", "동점으로 나온 영역 이름을 적고 공통 원인을 한 문장으로 정리하기", "오늘 대응할 일과 내일로 넘길 일을 분리하기"],
      weekly: ["동점 영역별로 반복되는 상황을 기록해 패턴 확인하기", "혼자 해결할 문제와 학교 차원의 조정이 필요한 문제를 나누기", "점수가 높은 영역 중 일상 기능을 가장 크게 흔드는 항목부터 도움 요청하기"],
      interpretation:
        "복합 신호형은 오류가 아니라 실제 현장에서 자주 나타나는 패턴입니다. 교사의 마음건강은 소진, 관계 긴장, 조직 보호감, 사건 경험이 겹쳐 나타날 수 있습니다.",
    };
  }

  const profile = profiles[result.top];
  const secondaryProfile = profiles[result.secondary];

  return {
    ...profile,
    signalLabel: "보조 신호",
    signalTitle: secondaryProfile.title,
    signalBody: `${secondaryProfile.subtitle} ${secondaryProfile.description}`,
    interpretation:
      "점수는 질병 여부가 아니라 최근 2주 동안 어떤 회복 과제가 두드러지는지 보여줍니다. 주 유형은 가장 높은 영역, 보조 신호는 두 번째로 높은 영역이며, 위기 신호는 점수와 상관없이 별도로 우선 대응합니다.",
  };
}

function App() {
  const [step, setStep] = useState("intro");
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [risks, setRisks] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const resultRef = useRef(null);

  const perPage = 6;
  const visibleQuestions = questions.slice(page * perPage, page * perPage + perPage);
  const result = useMemo(() => scoreAnswers(answers, risks), [answers, risks]);
  const profile = useMemo(() => buildResultProfile(result), [result]);
  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === questions.length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const setAnswer = (id, value) => setAnswers((current) => ({ ...current, [id]: value }));
  const setRisk = (id) => setRisks((current) => ({ ...current, [id]: !current[id] }));
  const scrollToTop = () => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));

  const exportReport = async () => {
    if (!resultRef.current) return;
    setIsSaving(true);
    try {
      const url = await toPng(resultRef.current, {
        backgroundColor: "#fdfaf1",
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.href = url;
      link.download = "teacher-mindcare-report.png";
      link.click();
    } finally {
      setIsSaving(false);
    }
  };

  if (step === "intro") {
    return (
      <main className="app">
        <section className="hero">
          <div className="hero-copy">
            <img className="hero-title-art" src={`${import.meta.env.BASE_URL}images/maeum-anbu-title.png`} alt="마음 안부" />
            <p className="eyebrow">교사용 마음건강 자가 점검</p>
            <h1 className="sr-only">마음 안부</h1>
            <p className="hero-subtitle">최근 마음 상태를 차분히 살펴보는 시간</p>
            <p className="hero-description">
              최근 2주를 기준으로 소진, 불안, 우울, 분노, 도덕적 상처, 사건 후유 반응을 점검합니다.
              결과는 진단이 아니라 회복 방향을 찾기 위한 안내입니다.
            </p>
            <div className="trust-strip" aria-label="검사 핵심 정보">
              <span>36문항</span>
              <span>6개 유형</span>
              <span>개인정보 비저장</span>
            </div>
            <div className="hero-actions">
              <button className="primary" onClick={() => setStep("check")}>
                <ClipboardList size={18} />
                체크 시작
              </button>
            </div>
          </div>
          <div className="hero-preview" aria-label="검사 미리보기">
            <div className="preview-head">
              <span>마음 안부가 묻는 것</span>
              <strong>지금 필요한 회복의 방향을 찾습니다</strong>
            </div>
            <div className="preview-reflection">
              <p>
                <span>몸</span>
                쉬어도 회복되지 않는 피로가 남아 있나요?
              </p>
              <p>
                <span>마음</span>
                불안, 분노, 무력감 중 자주 올라오는 신호가 있나요?
              </p>
              <p>
                <span>회복</span>
                오늘 가장 먼저 줄이거나 부탁해야 할 일은 무엇인가요?
              </p>
            </div>
          </div>
        </section>

        <section className="start-flow" aria-label="진행 순서">
          <div className="start-flow-head">
            <p className="eyebrow">How It Works</p>
            <h2>시작하면 이렇게 진행됩니다</h2>
            <p>답변은 저장되지 않으며, 결과는 현재 상태를 이해하기 위한 안내로만 사용합니다.</p>
          </div>
          <div className="flow-list">
            <article className="flow-step">
              <span>1</span>
              <div>
                <strong>36문항 답하기</strong>
                <p>최근 2주를 떠올리며 0점부터 4점까지 선택합니다.</p>
              </div>
            </article>
            <article className="flow-step">
              <span>2</span>
              <div>
                <strong>위기 신호 확인</strong>
                <p>점수와 별도로 즉시 도움이 필요한 신호가 있는지 확인합니다.</p>
              </div>
            </article>
            <article className="flow-step">
              <span>3</span>
              <div>
                <strong>결과와 회복 행동 보기</strong>
                <p>6가지 유형 중 주 신호와 오늘 할 수 있는 조정 행동을 확인합니다.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section-block" id="safety">
          <div className="section-header">
            <p className="eyebrow">Before You Start</p>
            <h2>검사 전 알아둘 것</h2>
          </div>
          <div className="notice-row">
            <article>
              <AlertTriangle size={22} />
              <h2>위기 신호가 있으면 앱보다 사람이 먼저입니다</h2>
              <p>자해·자살 생각, 타해 우려, 극심한 불면과 공황이 있으면 즉시 109, 112/119, 가까운 응급실 또는 신뢰할 수 있는 사람에게 연결하세요.</p>
            </article>
            <article>
              <Stethoscope size={22} />
              <h2>치료나 상담을 대신하지 않습니다</h2>
              <p>결과는 현재 상태를 이해하기 위한 참고 자료입니다. 진단이나 치료 결정은 전문가 평가가 필요합니다.</p>
            </article>
            <article>
              <BookOpenCheck size={22} />
              <h2>개인정보를 저장하지 않습니다</h2>
              <p>현재 버전은 서버 저장 없이 브라우저에서 계산합니다. 이름, 학교, 연락처 입력을 요구하지 않습니다.</p>
            </article>
          </div>
        </section>

        <section className="method-section" id="method">
          <div className="method-intro">
            <p className="eyebrow">Structure & Evidence</p>
            <h2>검사 구조와 신뢰성 확보 방식</h2>
            <p>
              이 검사는 표준화 진단검사가 아니라 교사용 마음건강 선별 도구입니다. 신뢰성을 높이기 위해
              직업 소진의 국제적 개념, 공공 정신건강 자가검진의 선별 구조, 교사 직무 스트레스의 현장 맥락을
              함께 반영했습니다.
            </p>
          </div>
          <div className="method-grid">
            {evidenceItems.map((item) => (
              <article key={item.title}>
                <BookOpenCheck size={22} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="method-links">
            <a href="https://www.who.int/standards/classifications/frequently-asked-questions/burn-out-an-occupational-phenomenon" target="_blank" rel="noreferrer">
              WHO ICD-11 Burn-out
            </a>
            <a href="https://www.mentalhealth.go.kr/portal/mdexmnDtl/mdexmnTypeList.do" target="_blank" rel="noreferrer">
              국가정신건강정보포털 자가검진
            </a>
            <a href="https://www.moe.go.kr/" target="_blank" rel="noreferrer">
              교육부 교원 마음건강 지원
            </a>
          </div>
        </section>
        <footer className="watermark">LevLab</footer>
      </main>
    );
  }

  if (step === "check") {
    const canNext = visibleQuestions.every((question) => answers[question.id] !== undefined);
    const lastPage = page >= Math.ceil(questions.length / perPage) - 1;

    return (
      <main className="app check-layout">
        <header className="topbar">
          <button className="icon-button" onClick={() => setStep("intro")} aria-label="처음으로">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="eyebrow">자가 점검</p>
            <h1>최근 2주를 기준으로 답해주세요</h1>
          </div>
          <div className="progress-label">{progress}%</div>
        </header>

        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>

        <section className="question-list">
          {visibleQuestions.map((question, index) => (
            <article className="question-card" key={question.id}>
              <div className="question-head">
                <span>{page * perPage + index + 1}</span>
              </div>
              <h2>{question.text}</h2>
              <div className="scale-grid">
                {scale.map((item) => (
                  <button
                    key={item.value}
                    className={answers[question.id] === item.value ? "selected" : ""}
                    onClick={() => setAnswer(question.id, item.value)}
                  >
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>

        <footer className="step-actions">
          <button
            className="secondary"
            onClick={() => {
              setPage((current) => Math.max(0, current - 1));
              scrollToTop();
            }}
            disabled={page === 0}
          >
            <ArrowLeft size={18} />
            이전
          </button>
          <button
            className="primary"
            disabled={!canNext}
            onClick={() => {
              if (lastPage) {
                setStep("risk");
              } else {
                setPage((current) => current + 1);
              }
              scrollToTop();
            }}
          >
            {lastPage ? "위기 신호 확인" : "다음"}
            <ArrowRight size={18} />
          </button>
        </footer>
      </main>
    );
  }

  if (step === "risk") {
    return (
      <main className="app check-layout">
        <header className="topbar">
          <button className="icon-button" onClick={() => setStep("check")} aria-label="문항으로 돌아가기">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="eyebrow">안전 확인</p>
            <h1>먼저 안전 신호를 확인합니다</h1>
          </div>
        </header>

        <section className="risk-box">
          <AlertTriangle size={28} />
          <div>
            <h2>점수보다 먼저 살펴봐야 할 항목입니다</h2>
            <p>이 항목은 점수화하지 않고, 지금 도움이 필요한 상황인지 확인하기 위한 단계입니다.</p>
          </div>
        </section>

        <section className="risk-list">
          {riskQuestions.map((question) => (
            <button className={risks[question.id] ? "risk-item active" : "risk-item"} key={question.id} onClick={() => setRisk(question.id)}>
              <span>{risks[question.id] ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}</span>
              {question.text}
            </button>
          ))}
        </section>

        <footer className="step-actions">
          <button
            className="secondary"
            onClick={() => {
              setStep("check");
              scrollToTop();
            }}
          >
            <ArrowLeft size={18} />
            이전
          </button>
          <button
            className="primary"
            onClick={() => {
              setStep("result");
              scrollToTop();
            }}
            disabled={!complete}
          >
            결과 보기
            <Sparkles size={18} />
          </button>
        </footer>
      </main>
    );
  }

  return (
    <main className="app result-layout">
      <div className="report-capture" ref={resultRef}>
        <header className="result-hero">
          <div>
            <p className="eyebrow">개인 리포트</p>
            <h1>{profile.title}</h1>
            <p>{profile.subtitle}</p>
            <div className="profile-pair">
              <span>{profile.signalLabel}</span>
              <strong>{profile.signalTitle}</strong>
            </div>
          </div>
          <div className="score-dial">
            <span>{result.severity}</span>
            <strong>{result.overallScore}</strong>
            <small>전체 부담</small>
          </div>
        </header>

        {result.riskFlag && (
          <section className="crisis-banner">
            <AlertTriangle size={24} />
            <div>
              <strong>위기 신호가 체크되었습니다.</strong>
              <p>지금은 결과 해석보다 안전 연결이 우선입니다. 109 자살예방상담전화, 112/119, 가까운 응급실, 신뢰할 수 있는 동료나 가족에게 즉시 알리세요.</p>
            </div>
          </section>
        )}

        <section className="result-grid">
          <article className="wide-card">
            <p className="result-kicker">메인 유형 해석</p>
            <h2>{profile.title}에 대한 해석</h2>
            <p>{profile.description}</p>
            <div className="secondary-profile">
              <span className="result-kicker">{profile.signalLabel} 설명</span>
              <strong>{profile.signalTitle}</strong>
              <span>{profile.signalBody}</span>
            </div>
            {profile.detailProfiles && (
              <div className="combined-details">
                <span className="result-kicker">{profile.detailTitle}</span>
                <p>{profile.detailLead}</p>
                <div className="detail-card-list">
                  {profile.detailProfiles.map((item) => (
                    <article className="detail-card" key={item.key}>
                      <div className="detail-card-head">
                        <span aria-hidden="true">{item.mark}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.subtitle}</p>
                        </div>
                      </div>
                      <p>{item.description}</p>
                      <div className="detail-action-grid">
                        <div>
                          <b>오늘 도움이 되는 행동</b>
                          <ul className="check-list">
                            {item.immediate.slice(0, 2).map((action) => <li key={action}>{action}</li>)}
                          </ul>
                        </div>
                        <div>
                          <b>이번 주 살펴볼 조정</b>
                          <ul className="check-list">
                            {item.weekly.slice(0, 2).map((action) => <li key={action}>{action}</li>)}
                          </ul>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="overlap-note">
                  <strong>함께 나타날 때의 핵심 해석</strong>
                  <p>{profile.overlapExplanation}</p>
                </div>
              </div>
            )}
            <div className="interpretation-note">
              <strong>해석 원칙</strong>
              <span>{profile.interpretation}</span>
            </div>
            <div className="domain-bars">
              {result.sorted.map(([key, value]) => (
                <div className="bar-row" key={key}>
                  <span>{domains[key]}</span>
                  <div><i style={{ width: `${value}%` }} /></div>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h2>오늘 바로 할 일</h2>
            <ul className="check-list">
              {profile.immediate.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article>
            <h2>이번 주 회복 설계</h2>
            <ul className="check-list">
              {profile.weekly.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </section>
        <footer className="watermark">LevLab</footer>
      </div>

      <section className="report-actions">
        <article>
          <h2>리포트 관리</h2>
          <div className="button-stack">
            <button className="secondary" onClick={exportReport} disabled={isSaving}>
              <Download size={18} />
              {isSaving ? "이미지 생성 중" : "이미지 저장"}
            </button>
            <button className="secondary" onClick={() => {
              setAnswers({});
              setRisks({});
              setPage(0);
              setStep("intro");
            }}>
              <RefreshCw size={18} />
              다시 하기
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
