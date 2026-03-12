"use client";

import { useState } from "react";

export default function RSVPWidget({ slug }: any) {

  const [name, setName] = useState("");
  const [attending, setAttending] = useState("yes");
  const [submitted, setSubmitted] = useState(false);

  async function submit(e:any) {
    e.preventDefault();

    await fetch("/api/widgets/rsvp", {
      method:"POST",
      body:JSON.stringify({
        microsite_slug: slug,
        name,
        attending: attending === "yes"
      })
    });

    setSubmitted(true);
  }

  if(submitted)
    return <div className="text-center">Thank you for your RSVP!</div>

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md">

      <input
        value={name}
        onChange={(e)=>setName(e.target.value)}
        className="w-full border rounded-lg p-2"
        placeholder="Your name"
      />

      <select
        value={attending}
        onChange={(e)=>setAttending(e.target.value)}
        className="w-full border rounded-lg p-2"
      >
        <option value="yes">Attending</option>
        <option value="no">Not attending</option>
      </select>

      <button className="bg-black text-white px-4 py-2 rounded-lg">
        RSVP
      </button>

    </form>
  )
}