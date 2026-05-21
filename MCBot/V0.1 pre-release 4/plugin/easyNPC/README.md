*This is an example plugin for MCBot.*

# How to edit `NPC.json`

```json
[
    {
        "basic": {
            "host": "ServerIP(Host)",
            "port": ServerPort, 
            "username": "PlayerName", 
            "version": "1.21.11", 
            "auth": "offline", 
            "password": "/login"
        },
        "button": [
            {"x": ButtonX, "y": ButtonY, "z": ButtonZ, "id": the index of the button in this list}
        ],
        "act": [
            {
                "type": "end",
                "message": [],
                "next": []
            },
            {
                "type": "talk",
                "message": ["hi"],
                "next": ["Hi! How are you?","[1]Fine"]
            }
            {
                "type": "button",
                "message": [0],
                "next": [1,0]
            }
        ]
    }
]
```

*Maybe I Will Make A Visual Editor Later*
