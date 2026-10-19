package com.jkoe16.server;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GameWebSocketHandler extends TextWebSocketHandler {
    private final Map<String, GameRoom> rooms = new ConcurrentHashMap<>();
    private final Map<String, String> sessionRoom = new ConcurrentHashMap<>();
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("WS connected: " + session.getId());
        ObjectNode n = MAPPER.createObjectNode();
        n.put("type", "system");
        n.put("message", "connected");
        session.sendMessage(new TextMessage(MAPPER.writeValueAsString(n)));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("Received: " + payload);

        JsonNode node;
        try {
            node = MAPPER.readTree(payload);
        } catch (Exception e) {
            ObjectNode err = MAPPER.createObjectNode();
            err.put("type", "error");
            err.put("message", "invalid json");
            session.sendMessage(new TextMessage(MAPPER.writeValueAsString(err)));
            return;
        }

        String type = node.has("type") ? node.get("type").asText() : "";
        if ("join".equals(type)) {
            String roomId = node.has("room") ? node.get("room").asText() : "default";
            String name = node.has("name") ? node.get("name").asText() : "guest";
            String classId = node.has("class") ? node.get("class").asText() : "warrior";
            GameRoom room = rooms.computeIfAbsent(roomId, GameRoom::new);
            room.addPlayer(session, name, classId);
            sessionRoom.put(session.getId(), roomId);
            return;
        }

        if ("action".equals(type)) {
            String roomId = sessionRoom.get(session.getId());
            if (roomId == null) {
                ObjectNode err = MAPPER.createObjectNode();
                err.put("type", "error");
                err.put("message", "not in room");
                session.sendMessage(new TextMessage(MAPPER.writeValueAsString(err)));
                return;
            }
            GameRoom room = rooms.get(roomId);
            if (room == null) {
                ObjectNode err = MAPPER.createObjectNode();
                err.put("type", "error");
                err.put("message", "room not found");
                session.sendMessage(new TextMessage(MAPPER.writeValueAsString(err)));
                return;
            }
            room.handleAction(session, (ObjectNode) node);
            return;
        }

        // fallback echo
        ObjectNode resp = MAPPER.createObjectNode();
        resp.put("type", "server_echo");
        resp.set("payload", node);
        session.sendMessage(new TextMessage(MAPPER.writeValueAsString(resp)));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        String roomId = sessionRoom.remove(session.getId());
        if (roomId != null) {
            GameRoom room = rooms.get(roomId);
            if (room != null) room.removePlayer(session);
        }
        super.afterConnectionClosed(session, status);
    }
}
