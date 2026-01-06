const fs = require('fs');

// 훅 실행 로깅 (항상 출력)
console.error('🚀 디스패처 실행됨!');

try {
    // Claude가 stdin을 통해 전달한 JSON 데이터를 읽습니다.
    const input = fs.readFileSync(0, 'utf8');
    const data = JSON.parse(input);

    const toolName = data.tool_name;
    // 파일 경로는 tool_input 객체 안에 다양한 형태로 존재할 수 있어, 순차적으로 확인합니다.
    const filePath = data.tool_input.path || data.tool_input.file_path || (data.tool_input.args && data.tool_input.args[0]) || '';

    console.error(`🔧 Tool: ${toolName}, 📁 File: ${filePath}`);

    // 파일 경로가 없으면 스킵 (Bash 등의 도구)
    if (!filePath) {
        console.error("ℹ️  파일 경로 없음, 검사 스킵");
        process.exit(0);
    }

    // ===== 기존 보안 규칙들 (그대로 유지) =====
    
    // 규칙 1: .env 파일 접근 제어
    if (filePath.includes('.env')) {
        if (toolName === 'Read' || toolName === 'Grep') {
            console.error("❌ 보안 규칙 위반: .env 파일은 읽을 수 없습니다. 작업이 차단되었습니다.");
            process.exit(2);
        }
    }

    // 규칙 2: 마이그레이션 파일 수정 제어
    if (filePath.includes('src/db/migrations/')) {
        if (toolName === 'Edit' || toolName === 'Write' || toolName === 'MultiEdit') {
            console.error("❌ 데이터 불변성 규칙 위반: 마이그레이션 파일은 수정할 수 없습니다. 새 마이그레이션 파일을 생성하세요. 작업이 차단되었습니다.");
            process.exit(2);
        }
    }

    // 규칙 3: 서비스 파일 문서화 정책
    if (filePath.includes('src/services/')) {
        if (toolName === 'Create' || toolName === 'Edit' || toolName === 'Write') {
            const content = data.tool_input.content || '';
            if (!content.includes('@author')) {
                console.error("❌ 문서화 규칙 위반: 서비스 파일에는 반드시 '@author' JSDoc 태그가 포함되어야 합니다. 작업이 차단되었습니다.");
                process.exit(2);
            }
        }
    }

    // 규칙 4: DB 모델 파일명 규칙 (Snake case)
    if (filePath.includes('src/db/model/')) {
        if (toolName === 'Create' || toolName === 'Write') {
            const fileName = filePath.split('/').pop();
            const nameWithoutExt = fileName ? fileName.split('.')[0] : '';
            const snakeCasePattern = /^[a-z]+(_[a-z]+)*$/;

            if (!snakeCasePattern.test(nameWithoutExt)) {
                console.error(`❌ 파일명 규칙 위반: src/db/model 디렉토리의 파일명은 반드시 snake_case여야 합니다. (예: user_profile.ts) 현재 파일명: ${fileName}. 작업이 차단되었습니다.`);
                process.exit(2);
            }
        }
    }

    // ===== 새로운 아키텍트 멘토 규칙들 =====
    
    // 멘토 규칙 1: 라우터 파일 수정 시 멘토링
    if (filePath.includes('/routes/') && (toolName === 'Edit' || toolName === 'Create' || toolName === 'Write')) {
        const fileName = filePath.split('/').pop() || '';
        const entityName = fileName.replace(/Routes?\.(js|ts)$/i, '');
        
        console.error(`🎯 [라우터 수정 감지] ${entityName} API 라우터를 수정하려고 합니다.`);
        console.error(`📚 아키텍트 멘토의 조언: 라우터 수정 전에 다음을 확인하세요:`);
        console.error(`   - src/models/${entityName}.js (데이터 모델)`);
        console.error(`   - src/services/${entityName}Service.js (비즈니스 로직)`);
        console.error(`   - 기존 API 패턴과의 일관성`);
        console.error(`먼저 관련 파일들을 읽고 계획을 세워주세요!`);
        process.exit(2);
    }

    // 멘토 규칙 2: 모델 파일 수정 시 영향도 경고
    if (filePath.includes('/models/') && (toolName === 'Edit' || toolName === 'Write')) {
        console.error(`🗃️ [모델 수정 경고] 데이터 모델 변경은 신중해야 합니다!`);
        console.error(`📋 체크리스트: □ 기존 데이터 호환성 □ API 응답 변경 □ 마이그레이션 필요성`);
        console.error(`영향도를 분석한 후 계획을 세워주세요.`);
        process.exit(2);
    }

    // 위의 모든 규칙에 해당하지 않으면 작업을 허용합니다.
    console.error("✅ 모든 규칙 통과");
    process.exit(0);

} catch (error) {
    console.error(`❌ 디스패처 오류: ${error.message}`);
    process.exit(0);
}