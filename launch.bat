@echo off
rem Infinite loop, counting from 1 to 10 with increment of 0.
for /L %%n in (1,0,10) do (
    node discord_bot.js
)