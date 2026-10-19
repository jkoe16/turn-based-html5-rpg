package com.jkoe16.server;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class GameRoom {
    public final String id;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, PlayerState> players = new ConcurrentHashMap<>();
    private final List<String> turnOrder = Collections.synchronizedList(new ArrayList<>());
    private int currentTurnIndex = 0;
    private boolean inCombat = false;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public GameRoom(String id) {
        this.id = id;
    }

    public synchronized void addPlayer(WebSocketSession session, String playerName, String classId) throws IOException {
        sessions.put(session.getId(), session);
        PlayerState ps = PlayerState.createDefault(playerName, classId);
        players.put(session.getId(), ps);
        broadcastRoomState();
        startIfReady();
    }

    public synchronized void removePlayer(WebSocketSession session) throws IOException {
        sessions.remove(session.getId());
        players.remove(session.getId());
        turnOrder.remove(session.getId());
        if (sessions.size() < 2) inCombat = false;
        broadcastRoomState();
    }

    private synchronized void startIfReady() throws IOException {
        if (!inCombat && sessions.size() >= 2) {
            // initialize turn order from current sessions
            turnOrder.clear();
            turnOrder.addAll(sessions.keySet());
            currentTurnIndex = 0;
            inCombat = true;
            broadcastRoomState();
            broadcastSystemMessage("전투 시작");
            broadcastCurrentTurn();
        }
    }

    public synchronized void handleAction(WebSocketSession session, ObjectNode actionNode) throws IOException {
        if (!inCombat) {
            sendTo(session, createError("Not in combat"));
            return;
        }
        String sid = session.getId();
        if (!turnOrder.get(currentTurnIndex).equals(sid)) {
            sendTo(session, createError("Not your turn"));
            return;
        }

        String actionType = actionNode.has("action") ? actionNode.get("action").asText() : "";
        if (actionType.isEmpty()) {
            sendTo(session, createError("Missing action type"));
            return;
        }

        // target is next player in turnOrder (simple 1v1 logic)
        String targetId = turnOrder.get((currentTurnIndex + 1) % turnOrder.size());
        PlayerState attacker = players.get(sid);
        PlayerState target = players.get(targetId);

        int damage = 0;
        if ("attack".equals(actionType)) {
            damage = Math.max(1, attacker.attack - target.defense);
        } else if ("skill".equals(actionType) && actionNode.has("skillId")) {
            String skillId = actionNode.get("skillId").asText();
            // for prototype: simple skill mapping
            if ("fireball".equals(skillId)) damage =  (attacker.attack + 25);
            else if ("slash".equals(skillId)) damage = (attacker.attack + 10);
            else if ("heal".equals(skillId)) {
                int heal = 30;
                attacker.hp = Math.min(attacker.maxHP, attacker.hp + heal);
                ObjectNode result = MAPPER.createObjectNode();
                result.put("type", "action_result");
                result.put("action", "heal");
                result.put("player", attacker.name);
                result.put("heal", heal);
                result.put("hp", attacker.hp);
                broadcast(result);
                advanceTurn();
                return;
            } else {
                damage = Math.max(1, attacker.attack - target.defense);
            }
        } else {
            sendTo(session, createError("Unknown action"));
            return;
        }

        target.hp -= damage;
        if (target.hp < 0) target.hp = 0;

        ObjectNode result = MAPPER.createObjectNode();
        result.put("type", "action_result");
        result.put("action", actionType);
        result.put("player", attacker.name);
        result.put("target", target.name);
        result.put("damage", damage);
        result.put("targetHp", target.hp);

        broadcast(result);

        if (target.hp <= 0) {
            inCombat = false;
            ObjectNode end = MAPPER.createObjectNode();
            end.put("type", "combat_end");
            end.put("winner", attacker.name);
            broadcast(end);
            broadcastRoomState();
        } else {
            advanceTurn();
        }
    }

    private synchronized void advanceTurn() throws IOException {
        currentTurnIndex = (currentTurnIndex + 1) % Math.max(1, turnOrder.size());
        broadcastCurrentTurn();
    }

    private void broadcastCurrentTurn() throws IOException {
        ObjectNode n = MAPPER.createObjectNode();
        n.put("type", "current_turn");
        String sid = turnOrder.get(currentTurnIndex);
        PlayerState p = players.get(sid);
        n.put("player", p != null ? p.name : sid);
        broadcast(n);
    }

    private void broadcastRoomState() throws IOException {
        ObjectNode state = MAPPER.createObjectNode();
        state.put("type", "room_state");
        state.put("room", id);
        for (Map.Entry<String, PlayerState> e : players.entrySet()) {
            ObjectNode p = state.putObject(e.getKey());
            p.put("name", e.getValue().name);
            p.put("hp", e.getValue().hp);
            p.put("mp", e.getValue().mp);
        }
        broadcast(state);
    }

    private void broadcastSystemMessage(String msg) throws IOException {
        ObjectNode n = MAPPER.createObjectNode();
        n.put("type", "system");
        n.put("message", msg);
        broadcast(n);
    }

    private void broadcast(ObjectNode node) throws IOException {
        TextMessage tm = new TextMessage(MAPPER.writeValueAsString(node));
        for (WebSocketSession s : sessions.values()) {
            if (s.isOpen()) {
                s.sendMessage(tm);
            }
        }
    }

    private void sendTo(WebSocketSession s, ObjectNode node) throws IOException {
        if (s.isOpen()) s.sendMessage(new TextMessage(MAPPER.writeValueAsString(node)));
    }

    private ObjectNode createError(String msg) {
        ObjectNode e = MAPPER.createObjectNode();
        e.put("type", "error");
        e.put("message", msg);
        return e;
    }

    private static class PlayerState {
        public String name;
        public int maxHP;
        public int hp;
        public int maxMP;
        public int mp;
        public int attack;
        public int defense;

        public PlayerState(String name, int maxHP, int maxMP, int attack, int defense) {
            this.name = name;
            this.maxHP = maxHP;
            this.hp = maxHP;
            this.maxMP = maxMP;
            this.mp = maxMP;
            this.attack = attack;
            this.defense = defense;
        }

        public static PlayerState createDefault(String name, String classId) {
            // simple class-based defaults
            switch (classId) {
                case "mage": return new PlayerState(name, 90, 60, 8, 4);
                case "priest": return new PlayerState(name, 100, 50, 6, 6);
                case "rogue": return new PlayerState(name, 100, 30, 14, 5);
                case "warrior":
                default:
                    return new PlayerState(name, 140, 20, 18, 10);
            }
        }
    }
}
