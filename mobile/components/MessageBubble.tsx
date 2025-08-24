import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface Message {
    text: string;
    isUser: boolean;
    isLoading?: boolean;
    timestamp: Date;
}

// --- MARKDOWN PARSER ---
const parseMarkdown = (text: string, isUser: boolean) => {
    if (!text) return null;

    const textColor = isUser ? "text-white" : "text-gray-800";
    const codeColor = isUser ? "text-green-100" : "text-blue-600";
    const boldColor = isUser ? "text-white" : "text-gray-900";

    let keyCounter = 0;
    const getUniqueKey = (prefix: string) => `${prefix}-${keyCounter++}`;

    // Split text by code blocks ```...```
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);

    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
        if (index % 2 === 1) {
            // This is a code block
            const isMultiline = part.includes("\n");

            elements.push(
                <View
                    key={getUniqueKey("codeblock")}
                    className={`mt-2 mb-2 p-3 rounded-lg ${isUser ? "bg-green-600" : "bg-gray-200"
                        } ${isMultiline ? "w-full" : "self-start"}`}   // <--- FIX
                >
                    <Text className={`font-mono text-sm ${codeColor}`} selectable>
                        {part.trim()}
                    </Text>
                </View>
            );
        }
        else {
            // --- Regular inline text ---
            const inlineElements = parseInlineMarkdown(
                part,
                textColor,
                boldColor,
                codeColor,
                getUniqueKey
            );
            if (inlineElements.length > 0) {
                elements.push(
                    <Text
                        key={getUniqueKey("paragraph")}
                        className={`${textColor} mb-2 leading-6`}
                    >
                        {inlineElements}
                    </Text>
                );
            }
        }
    });

    return elements;
};

const parseInlineMarkdown = (
    text: string,
    textColor: string,
    boldColor: string,
    codeColor: string,
    getUniqueKey: (prefix: string) => string
) => {
    if (!text.trim()) return [];

    const elements: React.ReactNode[] = [];
    const lines = text.split("\n");

    lines.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
            elements.push("\n"); // line break
        }

        // --- Lists ---
        const listMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
        if (listMatch) {
            const [, , content] = listMatch;
            elements.push(
                <View key={getUniqueKey("list")} className="flex-row mt-1">
                    <Text className={`${textColor} mr-2`}>•</Text>
                    <Text className={`${textColor} flex-1`}>
                        {parseLineContent(content, textColor, boldColor, codeColor, getUniqueKey)}
                    </Text>
                </View>
            );
            return;
        }

        // --- Headers ---
        const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headerMatch) {
            const [, hashes, content] = headerMatch;
            const headerLevel = hashes.length;
            const fontSize =
                headerLevel === 1
                    ? "text-xl"
                    : headerLevel === 2
                        ? "text-lg"
                        : "text-base";

            elements.push(
                <Text
                    key={getUniqueKey("header")}
                    className={`${boldColor} ${fontSize} font-bold mt-2 mb-1`}
                >
                    {content}
                </Text>
            );
            return;
        }

        // --- Regular line ---
        if (line.trim()) {
            elements.push(
                <Text key={getUniqueKey("line")} className={textColor}>
                    {parseLineContent(line, textColor, boldColor, codeColor, getUniqueKey)}
                </Text>
            );
        }
    });

    return elements;
};

const parseLineContent = (
    text: string,
    textColor: string,
    boldColor: string,
    codeColor: string,
    getUniqueKey: (prefix: string) => string
) => {
    const elements: React.ReactNode[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        // --- Inline code ---
        const inlineCodeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/);
        if (inlineCodeMatch) {
            const [, before, code, after] = inlineCodeMatch;

            if (before) {
                elements.push(
                    <Text key={getUniqueKey("before")} className={textColor}>
                        {parseBoldItalic(before, textColor, boldColor, getUniqueKey)}
                    </Text>
                );
            }

            elements.push(
                <Text
                    key={getUniqueKey("inlinecode")}
                    className={`font-mono text-sm px-1 py-0.5 rounded ${codeColor} bg-black/20`}
                >
                    {code}
                </Text>
            );

            remaining = after;
            continue;
        }

        // --- Remaining plain text ---
        elements.push(
            <Text key={getUniqueKey("remaining")} className={textColor}>
                {parseBoldItalic(remaining, textColor, boldColor, getUniqueKey)}
            </Text>
        );
        break;
    }

    return elements;
};

const parseBoldItalic = (
    text: string,
    textColor: string,
    boldColor: string,
    getUniqueKey: (prefix: string) => string
) => {
    const elements: React.ReactNode[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        // --- Bold ---
        const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)/);
        if (boldMatch) {
            const [, before, bold, after] = boldMatch;

            if (before) {
                elements.push(
                    <Text key={getUniqueKey("before-bold")} className={textColor}>
                        {before}
                    </Text>
                );
            }

            elements.push(
                <Text key={getUniqueKey("bold")} className={`${boldColor} font-bold`}>
                    {bold}
                </Text>
            );

            remaining = after;
            continue;
        }

        // --- Italic ---
        const italicMatch = remaining.match(/^(.*?)\*([^*]+)\*(.*)/);
        if (italicMatch) {
            const [, before, italic, after] = italicMatch;

            if (before) {
                elements.push(
                    <Text key={getUniqueKey("before-italic")} className={textColor}>
                        {before}
                    </Text>
                );
            }

            elements.push(
                <Text key={getUniqueKey("italic")} className={`${textColor} italic`}>
                    {italic}
                </Text>
            );

            remaining = after;
            continue;
        }

        // --- Plain ---
        elements.push(
            <Text key={getUniqueKey("plain")} className={textColor}>
                {remaining}
            </Text>
        );
        break;
    }

    return elements;
};

// --- MESSAGE BUBBLE ---
const MessageBubble = ({ message }: { message: Message }) => {
    return (
        <View className={`mb-4 px-2 ${message.isUser ? "items-end" : "items-start"}`}>
                
                    <View
                    className={`max-w-[80%] shrink px-4 py-3 rounded-2xl ${message.isUser
                            ? "bg-green-500 rounded-br-md"
                            : "bg-gray-100 rounded-bl-md"
                        }`}
                >
                    {message.isLoading ? (
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#666" />
                            <Text className="text-gray-600 ml-2">Thinking...</Text>
                        </View>
                    ) : (
                        <View style={{ flexShrink: 1 }}>{parseMarkdown(message.text, message.isUser)}</View>
                    )}
                </View>
                <View 
                    className={`flex-row ${message.isUser ? "justify-end" : "justify-start"}`}
                    style={{ paddingHorizontal: 8, marginTop: 4 }}
                >
                    <Text className="text-xs text-gray-400 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
            
        </View>
    );
};

export default MessageBubble;
