"""
Flask API Server for AI MemeScore Analysis

이 서버는 백엔드에서 점수 데이터를 받아서
AI 기반 MemeScore 분석 결과를 반환합니다.

MemeScore v2 공식 사용:
- Engagement Score: log10(1 + total_engagement) * 10
- View Score: log10(1 + views) * 5
- Follow Score: log10(1 + followers) * 8
- Tip Score: log10(1 + tip_count) * 3 + log10(1 + tip_amount) * 2
- MemeScore: engagement + view + follow + tip
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import math
from typing import Dict, Any
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)  # CORS 활성화

# OpenAI 클라이언트 초기화
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("⚠️ Warning: OPENAI_API_KEY not set. Using dummy responses.")
    client = None
else:
    client = OpenAI(api_key=OPENAI_API_KEY)

DEFAULT_MODEL = os.getenv("MEME_EXPLAINER_MODEL", "gpt-4o-mini")


# ============================================================
# MemeScore 계산 함수들 (dummy_explainer.py에서 가져옴)
# ============================================================

def compute_memescore_parts(
    likes: float,
    comments: float,
    reposts: float,
    quotes: float,
    views: float,
    followers: float,
    tip_count: float,
    tip_amount: float,
) -> Dict[str, float]:
    """MemeScore v2 계산 (Backend와 동일한 로직)"""
    # Engagement Score: log10(1 + total_engagement) * 10
    total_engagement = likes + comments + reposts + quotes
    engagement_score = math.log10(1 + total_engagement) * 10

    # View Score: log10(1 + views) * 5
    view_score = math.log10(1 + views) * 5

    # Follow Score: log10(1 + followers) * 8
    follow_score = math.log10(1 + followers) * 8

    # Tip Score: log10(1 + tip_count) * 3 + log10(1 + tip_amount) * 2
    tip_score = math.log10(1 + tip_count) * 3 + math.log10(1 + tip_amount) * 2

    # Final MemeScore
    meme_score = engagement_score + view_score + follow_score + tip_score

    return {
        "engagement_score": round(engagement_score, 1),
        "view_score": round(view_score, 1),
        "follow_score": round(follow_score, 1),
        "tip_score": round(tip_score, 1),
        "meme_score": round(meme_score, 1),
        "total_engagement": total_engagement,
    }


def compute_bot_score(
    likes: float,
    comments: float,
    reposts: float,
    quotes: float,
    views: float,
    followers: float,
) -> float:
    """봇 점수 계산 (높을수록 의심)"""
    if followers < 10:
        return 0.0

    total_engagement = likes + comments + reposts + quotes
    if total_engagement == 0 or views == 0:
        return 0.0

    engagement_rate = total_engagement / views
    follower_engagement = total_engagement / followers

    likes_ratio = likes / total_engagement if total_engagement > 0 else 0
    comments_ratio = comments / total_engagement if total_engagement > 0 else 0

    bot_score = 0.0

    # 비정상적으로 높은 참여율
    if engagement_rate > 0.5:
        bot_score += 30

    # 팔로워 대비 과도한 engagement
    if follower_engagement > 5:
        bot_score += 25

    # 좋아요만 많고 댓글이 없는 경우
    if likes_ratio > 0.9 and comments_ratio < 0.05:
        bot_score += 20

    # 비정상적으로 낮은 조회수
    if views > 0 and total_engagement / views > 0.8:
        bot_score += 25

    return min(bot_score, 100.0)


def build_creator_context(metrics: Dict[str, Any], bot_score: float) -> str:
    """LLM에 전달할 컨텍스트 생성"""
    lines = []
    lines.append("당신은 MemeX 플랫폼의 크리에이터 활동 분석 전문가입니다.")
    lines.append("아래는 최근 7일간의 활동 데이터입니다:\n")
    
    lines.append(f"- 최종 MemeScore: {metrics['meme_score']:.2f}")
    lines.append(f"- 반응 점수 (Engagement): {metrics['engagement_score']:.2f}")
    lines.append(f"- 조회 점수 (Views): {metrics['view_score']:.2f}")
    lines.append(f"- 팔로워 점수: {metrics['follow_score']:.2f}")
    lines.append(f"- Tip 점수: {metrics['tip_score']:.2f}\n")
    
    lines.append("세부 활동 지표:")
    lines.append(f"- 좋아요: {int(metrics.get('likes', 0))}개")
    lines.append(f"- 댓글: {int(metrics.get('comments', 0))}개")
    lines.append(f"- 리포스트: {int(metrics.get('reposts', 0))}개")
    lines.append(f"- 인용: {int(metrics.get('quotes', 0))}개")
    lines.append(f"- 조회수: {int(metrics.get('views', 0))}회")
    lines.append(f"- 팔로워: {int(metrics.get('followers', 0))}명")
    lines.append(f"- Tip 횟수: {int(metrics.get('tip_count', 0))}회")
    lines.append(f"- Tip 총액: {metrics.get('tip_amount', 0.0):.4f} ETH\n")
    
    if bot_score >= 50:
        lines.append(f"⚠️ 봇 의심 점수: {bot_score:.1f}/100 (비정상 활동 패턴 감지)")
    
    lines.append("\n다음 형식으로 5-7개의 bullet point로 분석을 작성해주세요:")
    lines.append("1. 전체적인 활동 수준과 MemeScore 평가")
    lines.append("2. 가장 강한 지표와 약한 지표 분석")
    lines.append("3. 개선을 위한 구체적인 조언")
    lines.append("4. (봇 점수가 높으면) 활동 패턴의 이상 징후 언급")
    lines.append("\n각 bullet은 '▪' 기호로 시작하고, 간결하고 실용적인 조언을 제공하세요.")
    
    return "\n".join(lines)


def call_llm_explainer(context: str) -> str:
    """OpenAI LLM을 호출하여 설명 생성"""
    if not client:
        # API 키가 없으면 더미 응답 반환
        return """🤖 AI 활동 요약 (7일)

▪ 현재 활동 수준은 보통이며, 꾸준한 콘텐츠 생산이 필요합니다.
▪ 조회수 대비 참여율을 높이기 위해 더 흥미로운 콘텐츠를 제작해보세요.
▪ 댓글과 인용을 유도하는 질문형 포스트가 효과적입니다.
▪ Tip을 받기 위해서는 팔로워와의 적극적인 소통이 중요합니다.
▪ 지속적인 활동으로 팔로워 기반을 확장하는 것을 추천합니다.

※ 데모 목적으로만 사용하세요. 투자 조언이 아닙니다."""

    try:
        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "당신은 소셜 미디어 분석 전문가입니다."},
                {"role": "user", "content": context}
            ],
            temperature=0.7,
            max_tokens=500,
        )
        
        content = response.choices[0].message.content or ""
        
        # 헤더 추가
        if not content.startswith("🤖"):
            content = "🤖 AI 활동 요약 (7일)\n\n" + content
        
        # 푸터 추가
        if "데모 목적" not in content and "투자 조언" not in content:
            content += "\n\n※ 데모 목적으로만 사용하세요. 투자 조언이 아닙니다."
        
        return content
    
    except Exception as e:
        print(f"LLM 호출 에러: {e}")
        return f"""🤖 AI 활동 요약 (7일)

▪ AI 분석 중 일시적인 오류가 발생했습니다.
▪ 기본 지표를 기반으로 활동을 계속 이어가세요.

※ 데모 목적으로만 사용하세요. 투자 조언이 아닙니다."""


# ============================================================
# API Endpoints
# ============================================================

@app.route('/health', methods=['GET'])
def health_check():
    """헬스체크 엔드포인트"""
    return jsonify({
        "status": "ok",
        "service": "AI MemeScore Analyzer",
        "openai_available": client is not None
    })


@app.route('/analyze', methods=['POST'])
def analyze_score():
    """
    점수 데이터를 받아 AI 분석 결과를 반환
    
    Request Body:
    {
        "likes": 180,
        "comments": 45,
        "reposts": 22,
        "quotes": 8,
        "views": 14500,
        "followers": 520,
        "tip_count": 4,
        "tip_amount": 1.2  // ETH 단위
    }
    
    Response:
    {
        "success": true,
        "analysis": "AI 분석 결과 텍스트",
        "score_breakdown": {
            "engagement_quality": 28.5,
            "virality_potential": 20.2,
            "community_strength": 21.8,
            "monetization_health": 3.2
        },
        "bot_score": 15.0
    }
    """
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['likes', 'comments', 'reposts', 'quotes', 'views', 'followers', 'tip_count', 'tip_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        # 데이터 추출
        likes = float(data['likes'])
        comments = float(data['comments'])
        reposts = float(data['reposts'])
        quotes = float(data['quotes'])
        views = float(data['views'])
        followers = float(data['followers'])
        tip_count = float(data['tip_count'])
        tip_amount = float(data['tip_amount'])
        
        # MemeScore 계산
        metrics = compute_memescore_parts(
            likes, comments, reposts, quotes,
            views, followers, tip_count, tip_amount
        )
        
        # 원본 데이터 추가
        metrics.update({
            'likes': likes,
            'comments': comments,
            'reposts': reposts,
            'quotes': quotes,
            'views': views,
            'followers': followers,
            'tip_count': tip_count,
            'tip_amount': tip_amount,
        })
        
        # 봇 스코어 계산
        bot_score = compute_bot_score(likes, comments, reposts, quotes, views, followers)
        
        # Score breakdown을 backend가 기대하는 형식으로 반환
        # engagement_quality, virality_potential, community_strength, monetization_health
        engagement_score = metrics.get('engagement_score', 0.0)
        view_score = metrics.get('view_score', 0.0)
        follow_score = metrics.get('follow_score', 0.0)
        tip_score = metrics.get('tip_score', 0.0)
        
        score_breakdown = {
            "engagement_quality": round(engagement_score, 1),
            "virality_potential": round(view_score, 1),
            "community_strength": round(follow_score, 1),
            "monetization_health": round(tip_score, 1),
        }
        
        # LLM 분석
        context_text = build_creator_context(metrics, bot_score)
        analysis = call_llm_explainer(context_text)
        
        return jsonify({
            "success": True,
            "analysis": analysis,
            "score_breakdown": score_breakdown,
            "bot_score": bot_score,
        })
    
    except Exception as e:
        print(f"분석 중 오류: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('AI_BACKEND_PORT', 4100))
    print(f"🚀 AI Backend Server starting on port {port}...")
    print(f"   OpenAI API: {'Enabled' if client else 'Disabled (using dummy responses)'}")
    app.run(host='0.0.0.0', port=port, debug=True)
