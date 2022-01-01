# H1 Pavlov Discord Bot
This is a Discord bot to help automate player registration, teams and roster moves for PAVLOV Quest VR.

You'll need your own .env file with these specific variables:

```
BOT_TOKEN=(discord bot token)
ALIASES_FILEPATH=(filepath of the aliases.json file)
BOT_ID=(discord bot id)

```

Here is the format of the .json file that this bot needs in order to work properly with the servers:
```
{
  "maps": {
    "cache": "UGC1695916905",
    "cache_comp": "UGC1730305772",
    "jungle": "UGC1921083944",
    "dust": "UGC1664873782",
    "dust_comp": "UGC1732443536",
    "industry": "UGC1679531002",
    "industry_comp": "UGC1734461750",
    "jordan": "UGC1485385932",
    "legend": "UGC1937414766",
    "legend_comp": "UGC1731023882",
    "manor": "UGC1944987722",
    "manor_comp": "UGC1763777855",
    "mirage": "UGC1661803933",
    "mirage_comp": "UGC1433506387",
    "nuke": "UGC1717551845",
    "office": "UGC1080743206",
    "office_comp": "UGC1733948120",
    "overpass": "UGC1676961583",
    "overpass_comp": "UGC1730981120",
    "oilrig": "UGC1701860633",
    "oilrig_comp": "UGC1862422738",
    "train": "UGC1677995860",
    "train_comp": "UGC1731023882",
    "snow_rush": "UGC1994132144",
    "ww2_rush": "UGC2075483313",
    "desert_rush": "UGC2116639602"
  },
  "players": {
    "652751313058267146": "q-Leggo"
  },
  "teams": {
    "Kings": [],
    "Pimps": [],
    "Nana's": []
  }
}

```


# H2 Bot commands

!register <inGameName>
Registers the player in the "players" object, adding "q-" for quest specific player.

!unregister 
Removes author's name from the "players" object - including any team player was associated with.

!createteam <teamName>
Creates a new Key, value pair in the "teams" object. The initial value of the new <teamName> key is set to an empty array.

!removeteam <teamName>
Removes team key and all associated values  from the "teams" object.

!addplayer <teamName> <@discordName>
Pushes a value to the <teamName> key if player is registered and is not already on another roster.

!removeplayer <teamName> <@discordName>
Removes player from roster of associated <teamName> key --- only if they are on specified <teamName> roster.