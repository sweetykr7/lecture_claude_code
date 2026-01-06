#!/usr/bin/env python3
"""
가장 간단한 MCP 서버 예제
계산기 도구를 제공하는 기본적인 MCP 서버입니다.
"""

import asyncio
import json
from mcp.server.lowlevel import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.types as types
import mcp.server.stdio


# MCP 서버 생성
server = Server("simple-calculator")


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """
    사용 가능한 도구 목록을 반환합니다.
    """
    return [
        types.Tool(
            name="calculate",
            description="간단한 수학 계산을 수행합니다. 예: 2+3, 10*5, 100/4",
            inputSchema={
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "계산할 수학 표현식 (예: '2+3', '10*5')"
                    }
                },
                "required": ["expression"]
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """
    도구 호출을 처리합니다.
    """
    if name != "calculate":
        raise ValueError(f"알 수 없는 도구: {name}")
    
    expression = arguments.get("expression")
    if not expression:
        raise ValueError("expression 파라미터가 필요합니다")
    
    try:
        # 보안상 eval 대신 간단한 계산만 허용
        # 실제 환경에서는 더 안전한 방법을 사용하세요
        allowed_chars = set('0123456789+-*/().')
        if not all(c in allowed_chars or c.isspace() for c in expression):
            raise ValueError("허용되지 않은 문자가 포함되어 있습니다")
        
        result = eval(expression)
        
        return [
            types.TextContent(
                type="text",
                text=f"계산 결과: {expression} = {result}"
            )
        ]
    
    except Exception as e:
        return [
            types.TextContent(
                type="text", 
                text=f"계산 오류: {str(e)}"
            )
        ]


async def main():
    """
    서버를 실행합니다.
    """
    # stdio를 통해 클라이언트와 통신
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="simple-calculator",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    asyncio.run(main())