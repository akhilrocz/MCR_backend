const express = require("express");

const app = express();

const { initializeDatabase } = require("./db/db.connect");

const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// const fs = require("fs");

const Job = require("./models/jobs.models");

app.use(express.json());

initializeDatabase();

app.get("/", (req, res) => {
  res.send("Hello Server");
});

app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/jobs/search", async (req, res) => {
  try {
    const { title } = req.query;
    const jobs = await Job.find({ jobTitle: { $regex: title, $options: "i" } });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: "Job Not Found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/jobs/post", async (req, res) => {
  try {
    console.log("Received Job Data:", req.body);

    if (!req.body.jobTitle || !req.body.companyName || !req.body.location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newJob = new Job(req.body);
    await newJob.save();

    res.status(201).json(newJob);
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/jobs/update/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/jobs/delete/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.json({ message: "Job deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running on PORT", PORT);
});

// const jsonData = fs.readFileSync("jobs.json", "utf-8");

// const jobsData = JSON.parse(jsonData);

// function seedData() {
//   try {
//     for (const jobData of jobsData) {
//       const newJob = new Job({
//         jobTitle: jobData.jobTitle,
//         companyName: jobData.companyName,
//         location: jobData.companyName,
//         salary: jobData.salary,
//         jobType: jobData.jobType,
//         jobDescription: jobData.jobDescription,
//         qualifications: jobData.qualifications,
//       });
//       newJob.save();
//     }
//   } catch (error) {
//     console.log("Error seeding data:", error);
//   }
// }

// seedData();
